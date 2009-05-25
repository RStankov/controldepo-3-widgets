//= require "controldepo"
//= require "extensions/event.js"

CD3.FontSwitcher = Class.create({
	initialize: function(panel, element, options){
		options = Object.extend({
			classname:	'text-size-',
			max: 		4,
			reset:		'a.reset',
			plus:		'a.plus',
			minus:		'a.minus'
		}, options || {});
		
		this.size		= 0;
		this.maxsize	= options.max;
		this.classname	= options.classname;
		this.element	= $(element);
		this.panel		= $(panel);
		
		if (options.plus)	this.panel.delegate(options.plus,  'click', this.change.bind(this,  1));
		if (options.reset)	this.panel.delegate(options.reset, 'click', this.change.bind(this,  0));
		if (options.minus)	this.panel.delegate(options.minus, 'click', this.change.bind(this, -1));
		
		this.element.select('font[size]').each(function(font){
			font._size = parseInt(font.getAttribute('size'));
		});
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
