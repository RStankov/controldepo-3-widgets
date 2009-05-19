//= require "header"

Event.wheel = function(element, callback) {
	var __onwheel = function (event) {
		var delta = 0;
		if (!event)
			event = window.event;
		if (event.wheelDelta){
			delta = event.wheelDelta/120; 
			if (window.opera) delta = -delta;
		} else if (event.detail)
			delta = -event.detail/3;
		delta = Math.round(delta, event); //Safari Round
		callback(delta);
		event.stop();
	}

	if(window.addEventListener)	// FF/DOM-Compliant Browsers
		$(element).addEventListener('DOMMouseScroll', __onwheel, false);
	else if(document.attachEvent) // IE
		$(element).observe('mousewheel', __onwheel);
};

CD3.Scroller = Class.create({
	initialize: function (container, scroller, options){
		// options
		options = this.options = Object.extend( {
			scrollSpeed:	1,
			scrollStep:		1,
			styleArrow:		'arrow',
			styleMoveUp:	'moveup',
			styleMoveDown:	'movedown',
			styleSlider:	'slider'
		}, options || {});					
		
		// base elements
		this.container	= $(container);
		this.scroller	= $(scroller);

		// arrows
		this.scroller.select('.' + options.styleArrow).each(function (el){
			el.observe('mousedown',	this.startScroll.bind(this, el));
			el.observe('mouseup',	this.stopScroll.bind(this));
			el.observe('mouseout',	this.stopScroll.bind(this));
		}.bind(this));
		
		// set handle
		var handle = this.handle = this.scroller.down('.' + options.styleSlider);
		
		this.sliderMaxHeight = handle.parentNode.offsetHeight - handle.offsetHeight;
			
		new Draggable(handle,{ 
			constraint: 'vertical', 
			snap: function(x, y) { return [x, this.validateTopPosition(y)]; }.bind(this),
			change: this.traceHandlePosition.bind(this),
			onStart: this.stopScroll.bind(this)
		});

		// trackpath
		this.trackPosition = $(handle.parentNode).observe('click', this.traceSliderClick.bind(this)).cumulativeOffset();
					
		// wheel
		Event.wheel(this.container, this.traceMouseWheel.bind(this));
				
		// check if needed	
		this.checkIfneeded();
	},
	startScroll: function (el) {
		this.stopScroll();
		this.interval = setInterval(function (dir) { this.scrollBy(dir); }.bind(this, el.hasClassName(this.options.styleMoveUp) ? -1 : 1), 3);
	},
	stopScroll: function () {
		clearInterval(this.interval);
		this.interval = null;
	},
	scrollBy: function (dir){
		this.handle.style.top	= this.validateTopPosition( (parseInt(this.handle.style.top) || 0) + dir ) + 'px';
		this.traceHandlePosition();
	},
	setHandlePosition: function() {
		var container			= this.container;
		this.handle.style.top	= (this.sliderMaxHeight * (container.scrollTop / (container.scrollHeight - container.offsetHeight))) + 'px';
	},
	validateTopPosition: function(y) {
		if (y <= 0) return 0;
		if (y >= this.sliderMaxHeight) return this.sliderMaxHeight;
		
		return y;
	},
	traceHandlePosition: function (){
		var scroll					= parseInt(this.handle.getStyle('top')) || 0;
		var container				= this.container;
		this.container.scrollTop	= (container.scrollHeight - container.offsetHeight) * (scroll/this.sliderMaxHeight);
	},
	traceMouseWheel: function(delta){
		this.stopScroll();
		if (delta != 0)
			this.scrollBy((delta > 0 ? -1 : 1) * 15);			
	},
	traceSliderClick: function(e){
		var clickedY = e.pointerY()  - this.trackPosition[1],
			top = parseInt(this.handle.style.top) || 0,
			height = this.handle.getHeight();

		if (clickedY < top || (top+height) < clickedY)
			new Effect.Morph(this.handle, {
				style:		 	{ top : this.validateTopPosition(clickedY) + 'px'},
				duration:	 	0.5,
				afterUpdate:	this.traceHandlePosition.bind(this),
				queue:			{scope: 'scroller', limit:1}
			});
	},
	checkIfneeded: function(){
		this.scroller[this.container.scrollHeight <= this.container.offsetHeight ? 'hide' : 'show']();
	}
});
