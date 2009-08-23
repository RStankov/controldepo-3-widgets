CD3.Widget.FontSwitcher = Class.create({
	initialize: function(panel, content, options){
		panel	= $(panel);
		options = Object.extend({
			className:	'text-size-',
			max: 		4,
			reset:		'.reset',
			plus:		'.plus',
			minus:		'.minus',
			callback:	false
		}, options || {});
		
		if (options.plus)	panel.delegate(options.plus,  'click', this.change.bind(this,  1));
		if (options.reset)	panel.delegate(options.reset, 'click', this.change.bind(this,  0));
		if (options.minus)	panel.delegate(options.minus, 'click', this.change.bind(this, -1));
		
		this.size		= 0;
		this.maxSize	= options.max;
		this.className	= options.className;
		this.content	= $(content);
		this.callback	= options.callback;
		
		this.content.select('font[size]').each(function(font){
			font._size = parseInt(font.getAttribute('size'));
		});
	},
	change: function(size, e){
		if (e && 'stop' in e) e.stop();
		
		size = size == 0 ? 0 : this.size + size, 0;
		size = size <  0 ? 0 : (size > this.maxSize ? this.maxSize : size);
		
		if (this.size != 0){
			this.content.removeClassName(this.className + this.size);
		}
			
		if (size != 0){
			this.content.addClassName(this.className + size);
		}
		
		this.size = size;
		this.content.select('font[size]').each(function(font){
			font.setAttribute('size', font._size + size);
		});
		
		if (this.callback) this.callback.call(this);
	}
});
