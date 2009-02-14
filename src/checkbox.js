//= require <src/header.js>

CD3.Checkbox = Class.create({
	initialize: function(checkbox){
		this.checkbox	= $(checkbox).hide();
		this.button		= new Element('a', {className:'checkbox', href:'javascript:;'}).update(' ');
		
		this.checkbox.insert({before: this.button});
		this.button.observe('click', this.toggle.bind(this));
		
		if (this.checkbox.checked)
			this.button.addClassName('selected');
	},
	toggle: function(){
		this.checkbox.checked = !this.checkbox.checked;
		this.button[this.checkbox.checked ? 'addClassName' : 'removeClassName']('selected');
	}
});
