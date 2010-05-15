CD3.Widget.FontSwitcher = Class.create(CD3.Widget.Base, {
  NAME: "CD3.Widget.FontSwitcher",
  
  setup: function(){
    this.content    = $(this.options.content);
    this.size       = this.element.getAttribute('data-size') || 0;

    this.content.select('font[size]').each(function(font){
      font.store('original:size', parseInt(font.getAttribute('size')));
    });
  },
  addObservers: function(){
    var options = this.options,
        change  = this.change;
    
    if (options.plus)  this.observers.push(this.element.on('click', options.plus,  change.bind(this,  1)));
    if (options.reset) this.observers.push(this.element.on('click', options.reset, change.bind(this,  0)));
    if (options.minus) this.observers.push(this.element.on('click', options.minus, change.bind(this, -1)));
  },
  change: function(size, e){
    if (e && Object.isFunction(e.stop)) e.stop();

    size = (size == 0 ? 0 : this.size + size).constrain(0, this.options.max);

    var options = this.options;

    if (this.size != 0){
      this.content.removeClassName(options.className + this.size);
    }

    if (size != 0){
      this.content.addClassName(options.className + size);
    }

    this.size = size;
    this.content.select('font[size]').each(function(font){
      font.setAttribute('size', font.retrieve('original:size') + size);
    });

    if (Object.isFunction(options.callback)) options.callback.call(this, this);
  }
});

CD3.Widget.FontSwitcher.DEFAULT_OPTIONS = {
  className:	'text-size-',
  max: 		    4,
  reset:		  '.reset',
  plus:		    '.plus',
  minus:		  '.minus',
  callback:   false,
  content:    null
};