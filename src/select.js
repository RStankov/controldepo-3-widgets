if (!CD3) var CD3 = {};

CD3.Select = Class.create(CD3.DropDown, {
	initialize: function(select){		
		select = $(select);
		
		// create replace elements
		this.container	= new Element('span', {className:'dropper'});
		this.link		= new Element('a', {href: 'javascript:;', className: 'drop'})
		this.linkspan	= new Element('span').update(select.selectedIndex > -1 ? select.options[select.selectedIndex || 0].text : '');
		this.hidden		= new Element('input', {type: 'hidden', name: select.name, value: select.getValue()});
		this.div		= new Element('div').hide();
		this.ul			= new Element('ul');
		
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
			topBottom: false
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
		if ($A(select.options).each(this.addOption.bind(this)).length > 6)
			this.div.addClassName('scrolled');
		
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
			new Element('a', {href: 'javascript:;'}).update(option.text).observe('click', this.select.bind(this, option))
		));
	},
	removeOptions: function(){
		this.ul.select('li').each(function(li){
			li.down('a').stopObserving('click');
			li.remove();
		});
	},
	select: function(option){
		this.linkspan.innerHTML = option.text;
		this.hidden.value		= option.value != null ? option.value : option.text;
		this.hide();
		
		if (this.onChange)
			this.onChange.call(this, option.value);
	}
});
