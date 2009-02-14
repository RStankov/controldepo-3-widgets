//= require <src/header.js>

CD3.FontSwitcher = Class.create({
	initialize: function(panel, element, options){
		options = Object.extend({
			classname:	'text-size-',
			max: 		4,
			reset:		'a.reset',
			plus:		'a.plus',
			minus:		'a.minus'
		}, options || {});
		
		var buttons = {};
		
		if (options.plus)	buttons[options.plus]	= this.change.bind(this, 1);
		if (options.reset)	buttons[options.reset]	= this.change.bind(this, 0);
		if (options.minus)	buttons[options.minus]	= this.change.bind(this, -1);
	
		this.size		= 0;
		this.buttons	= buttons;
		this.maxsize	= options.max;
		this.classname	= options.classname;
		this.element	= $(element);
		this.panel		= $(panel).observe('click', this.onClick.bind(this));
		this.element.select('font[size]').each(function(font){
			font._size = parseInt(font.getAttribute('size'));
		});
	},
	onClick: function(e){
		for(var b in this.buttons)
			if (e.findElement(b))
				return this.buttons[b]();
	},
	change: function(value){
		this.element.removeClassName(this.classname + this.size);
		
		var size = value == 0 ? 0 : this.size + value;
		
		this.size = size < 0 ? 0 : ( size > this.maxsize ? this.maxsize : size );
		
		if (this.size != 0) this.element.addClassName(this.classname + this.size);
		
		size = this.size;
		this.element.select('font[size]').each(function(font){
			font.setAttribute('size', font._size + size);
		});
	}
});
