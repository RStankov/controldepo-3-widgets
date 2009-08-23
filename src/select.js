CD3.Select = Class.create(CD3.DropDown, {
	initialize: function(select){		
		select = $(select);
		
		// create replace elements
		this.container	= new Element('span', {className:'dropper'});
		this.link		= new Element('a', {href: 'javascript:;', className: 'drop'})
		this.linkspan	= new Element('span').update(select.selectedIndex > -1 ? select.options[select.selectedIndex || 0].text : '');
		this.hidden		= new Element('input', {type: 'hidden', name: select.name, value: select.getValue()});
		this.div		= new Element('div').hide();
		this.ul			= new Element('ul').observe('click', this.selectOption.bind(this));
		
		if (select.className)
			this.container.addClassName(select.className);
		
		// insert container and all elements in it
		select.insert({
			 before: this.container
				.insert(this.link.insert(this.linkspan))
				.insert(this.hidden)
				.insert(this.div.insert(this.ul))
		});
		
		// get options
		var options = Object.extend({
			onChange: null,
			topBottom: false,
			reference: false,
			scrollLimit: 6
		}, arguments[1] || {});

		// add top / bottom lines		
		if (options.topBottom)
			this.ul.insert({
				before:	new Element('span', {className: 'top'}).insert(new Element('span')),
				after:	new Element('span', {className: 'bottom'}).insert(new Element('span'))
			});
			
		// do we have on change event
		if (options.onChange) this.onChange = options.onChange;
		
		// add options
		$A(select.options).each(this.addOption.bind(this))
		
		// check for scrolled class
		if (options.length > options.scrollLimit)
			this.div.addClassName('scrolled');
		
		if (options.reference)
			this.constructor.instances[Object.isString(options.reference) ? options.reference : select.name] = this;
		
		// delete old select
		Element.remove(select);
		
		// add events
		this.bindEvents();
	},
	destroy: function(){
		this.unbindEvents();
		this.removeOptions();
		this.container.remove();
	},
	addOption: function (option){
		this.ul.insert(new Element('li').insert(
			new Element('a', {href: 'javascript:;'})
				.store('option', {text: option.text, value: option.value != null ? option.value : option.text})
				.update(option.text)
		));
	},
	removeOptions: function(){
		this.ul.select('li').each(function(li){
			li.down('a').store('option', null).stopObserving('click');
			li.remove();
		});
	},
	setOptions: function(options, dontClear){
		if (dontClear !== true) this.removeOptions();

		$A(options).each(this.addOption.bind(this));

		if (dontClear !== true) this.select(options[0]);
	},
	selectOption: function(e){
		var element = e.findElement('a');
		if (element) this.select(element.retrieve('option'));
	},
	select: function(option){
		this.linkspan.innerHTML = option.text;
		this.hidden.value		= option.value;
		this.hide();
		
		if (this.onChange)
			this.onChange.call(this, option.value);
	}
});

CD3.Select.instances = {};
