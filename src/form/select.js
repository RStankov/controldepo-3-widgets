CD3.Form.Select = Class.create(CD3.Widget.DropDown, {
  NAME: 'CD3.Form.Select',
  setup: function(){
    var options = this.options;
        select  = this.element;
    
    this.container  = new Element('span', {className: options.classNames.container});
    this.trigger    = new Element('a', {href: '#', className: options.classNames.trigger})
    this.span       = new Element('span');
    this.menu		    = new Element('div').hide();
    this.ul			    = new Element('ul');
    this.element    = new Element('input', {type: 'hidden', name: select.readAttribute('select'), value: select.getValue()});

    if (select.className){
      this.container.addClassName(select.className);
    }

    select.insert({
      before: this.container.insert([
        this.element,
        this.trigger.insert(this.span),
        this.menu.insert(this.ul)
      ])
    });

    if (options.topBottom){
      this.ul.insert({
        before:	new Element('span', {className: options.classNames.top}).insert(new Element('span')),
        after:	new Element('span', {className: options.classNames.bottom}).insert(new Element('span'))
      });
    }

    if (options.onChange){
      this.onChange = options.onChange;
    }

    this.set(select.options);
    
    if (options.length > options.scrollLimit){
      this.div.addClassName(options.classNames.scrolled);
    }

    if (options.reference){
      this.constructor.instances[Object.isString(options.reference) ? options.reference : select.name] = this;
    }

    Element.remove(select);
    delete this.options;
  },
  addObservers: function($super){
    $super();
    this.observers.push(this.menu.on('click', 'a', this.selectOption.bind(this)));
  },
  destroy: function(){
    this.container.purge().remove();
    this.removeObservers();
  },
  add: function(option){
    this.ul.insert(
      new Element('li').insert(
        new Element('a', {href: '#'})
          .store('option', {text: option.text, value: option.value != null ? option.value : option.text})
          .update(option.text)
    ));
  },
  set: function(options, dontClear){
    if (dontClear !== true) this.ul.select('li').each(function(li){ li.purge().remove(); });

    $A(options).each(this.add.bind(this));

    if (dontClear !== true) this.select(options[0]);
  },
  selectOption: function(e, element){
    this.select(element.retrieve('option'));
  },
  select: function(option){
    var oldValue = this.element.getValue();
    
    this.span.update(option.text);
    this.element.setValue(option.value);
    this.hide();

    if (this.onChange && oldValue != option.value){
      this.onChange.call(this, option.value);
    }
  }
});

CD3.Form.Select.DEFAULT_OPTIONS = {
  classNames:   {
    trigger:    'drop',
    container:  'dropper',
    scrolled:   'scrolled',
    top:        'top',
    bottom:     'bottom'
  },
  onChange:     null,
	topBottom:    false,
	reference:    false,
	scrollLimit:  6
}
CD3.Form.Select.instances = {};
