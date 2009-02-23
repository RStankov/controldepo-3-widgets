CD3.Slider = Class.create({
	initialize: function(container, options){
		var options = Object.extend({
			prev: 			null,
			next:			null,
			scrollBy:		0,
			scrollType:		'horizontal',
			event:			'click',
			beforeSlide:	false,
			afterSlide:		false,
			effectDuration: 0.8
		}, options || {});
		
		this.container	= $(container);
		this.scroll		= options.scrollType == 'vertical' ? ['top', 'offsetHeight', 'y'] : ['left', 'offsetWidth', 'x'];
		this.prev		= $(options.prev).observe(options.event, this.slide.bind(this, options.scrollBy));
		this.next		= $(options.next).observe(options.event, this.slide.bind(this, -options.scrollBy));
		this.sliding	= false;
		
		this.effectOptions = {
			duration: options.effectDuration || 0.8 ,
			queue: {scope: 'cd3:slider', limit:1},
			afterFinish: this.afterSlide.bind(this, options.afterSlide)
		};
		
		if (options.beforeSlide){
			this.effectOptions = options.beforeSlide.bind(this);
		}
		
		var pos = parseInt(this.container.style[this.scroll[0]]) || 0;
		console.log(this);
		this.setVisibility('prev', pos != 0);
		this.setVisibility('next', this.container[this.scroll[1]] - (options.scrollBy - pos) >= 1);
	},
	setVisibility: function(button, visible){
		this[button].style.visibility = visible ? 'visible' : 'hidden';
	},
	slide: function(moveBy){
		if (this.sliding) return;
		
		var property	= parseInt(this.container.style[this.scroll[0]]) || 0,	// top or left
			offset		= this.container[this.scroll[1]]; // offsetHeight or offsetWidth
		
//		if ((moveBy > 0 && (property > -1 || property != 0)) || (moveBy < 0 && offset + moveBy + property < 0))
		if ((moveBy > 0 && property > 0) || (moveBy < 0 && property + offset + moveBy < 0)) return;
		
		this.setVisibility('prev', property + moveBy < 0);
		this.setVisibility('next', offset + property + moveBy * 2 > 1);
		this.sliding = true;
		
		moveBy = moveBy < 0 ? Math.max(moveBy, - (offset + property + moveBy)) : Math.min(moveBy, -property);
				
		var options = this.effectOptions;
		options[this.scroll[2]] = moveBy; // x or y
		console.log(options);
		new Effect.Move(this.container, options);
	},
	afterSlide: function(callback){
		this.sliding = false;
		if (callback) callback.call(this);
	}
});
