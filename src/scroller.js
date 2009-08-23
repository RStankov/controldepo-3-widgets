//= require "extensions/events/mouse_wheel"
//= require <vendor/dragdrop>

CD3.Scroller = Class.create({
	initialize: function(container, scroller, options){
		// options
		options = Object.extend({
			styleArrow:		'arrow',
			styleMoveUp:	'moveup',
			styleMoveDown:	'movedown',
			styleSlider:	'slider',
			drag:           true,
			speed:			1
		}, options || {});					
		
		// base elements
		this.speed		= options.speed;
		this.container	= $(container);
		this.scroller	= $(scroller);
		this.handle		= this.scroller.down('.' + options.styleSlider);
		
		// arrows
		this.scroller.select('.' + options.styleArrow).each(function(stop, arrow){
			arrow.observe('mouseup',  stop);
			arrow.observe('mouseout', stop);
		}.curry(this.stopScroll.bind(this)));
		
		this.scroller.observe('mousedown', function(e){
			var arrow = e.findElement('.' + options.styleArrow);
			if (arrow) this.startScroll(arrow.hasClassName(options.styleMoveUp) ? -1 : 1);
		}.bind(this));
		
		// handle
		if (options.drag) new Draggable(this.handle,{ 
			constraint:	'vertical', 
			snap:		function(x, y){ return [x, this.validateTopPosition(y)]; }.bind(this),
			change:		this.traceHandlePosition.bind(this)
		});

		// trackpath
		var trackpath = $(this.handle.parentNode).observe('click', this.traceSliderClick.bind(this));
		
		this.trackpathPositionY	= trackpath.cumulativeOffset()[1];
		this.sliderMaxHeight	= trackpath.getHeight() - this.handle.getHeight();
					
		// wheel
		this.container.observe('mouse:wheel', this.traceMouseWheel.bind(this));
		
		// check if needed	
		this.checkIfneeded();
	},
	startScroll: function(value){
		this.interval = setInterval(this.scrollBy.bind(this, value), 3);
	},
	stopScroll: function(){
		clearInterval(this.interval);
		this.interval = null;
	},
	scrollBy: function(dir){
		this.handle.style.top = this.validateTopPosition( this.getScrollPosition() + dir * this.speed ) + 'px';
		this.traceHandlePosition();
	},
	setHandlePosition: function(){
		this.handle.style.top = (this.sliderMaxHeight * (this.container.scrollTop / this.getVisibleHeight())) + 'px';
	},
	validateTopPosition: function(y){
		if (y <= 0)						return 0;
		if (y >= this.sliderMaxHeight)	return this.sliderMaxHeight;
		
		return y;
	},
	traceHandlePosition: function(){
		this.container.scrollTop = this.getVisibleHeight() * (this.getScrollPosition() / this.sliderMaxHeight);
	},
	traceMouseWheel: function(e){
		this.scrollBy(e.memo.delta > 0 ? -15 : 15);			
	},
	traceSliderClick: function(e){
		var clickedY = e.pointerY()  - this.trackpathPositionY,
			top		 = this.getScrollPosition(),
			height	 = this.handle.getHeight();

		// check to see we are no clicking the handle
		if (clickedY < top || (top+height) < clickedY)
			new Effect.Morph(this.handle, {
				style:		 	{ top : this.validateTopPosition(clickedY) + 'px'},
				duration:	 	0.5,
				afterUpdate:	this.traceHandlePosition.bind(this),
				queue:			{scope: 'cd3:scroller', limit:1}
			});
	},
	getScrollPosition: function(){
		return parseInt(this.handle.style.top) || 0;
	},
	getVisibleHeight: function(){
		return this.container.scrollHeight - this.container.offsetHeight;
	},
	checkIfneeded: function(){
		this.scroller[this.container.scrollHeight > this.container.offsetHeight ? 'hide' : 'show']();
	}
});
CD3.Scroller.createIfNeeded = function(container, scroller, options){
	container  = $(container);

	if (container.scrollHeight <= container.offsetHeight){
		$(scroller).hide();
		return null;
	}
	
	return new CD3.Scroller(container, scroller, options);
}