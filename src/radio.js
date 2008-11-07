if (!CD3) var CD3 = {};

CD3.Radio = Class.create({
	initialize: function(radio){
		this.radio	= $(radio).hide();
		this.name	= this.radio.getAttribute('name') || this.radio.identify();
		this.button	= new Element('a', {className:'radio', href:'javascript:;'}).update(' ');
		
		this.radio.insert({before: this.button});
		
		this.button.observe('click', this.toggle.bind(this));
		this.refresh();
		
		// becouse IE6 have buggy onchange event for radio buttons
		if (!this.constructor._elements[this.name])
			this.constructor._elements[this.name] = [];
		this.constructor._elements[this.name].push(this);
	},
	toggle: function(){
		this.radio.checked = !this.radio.checked;
		this.constructor._elements[this.name].invoke('refresh');
	},
	refresh: function(){
		this.button[this.radio.checked ? 'addClassName' : 'removeClassName']('selected');
	}
});
CD3.Radio._elements = {};