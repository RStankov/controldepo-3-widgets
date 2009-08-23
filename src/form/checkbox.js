CD3.Form.Checkbox = Class.create({
	initialize: function(checkbox){
		this.checkbox	= $(checkbox).hide();
		this.button		= new Element('a', {className:'checkbox', href:'javascript:;'}).update(' ');
		
		this.checkbox.insert({before: this.button});
		this.button.observe('click', this.toggle.bind(this));
		
		if (this.checkbox.className.length > 0){
			this.button.addClassName(this.checkbox.className);
		}
		
		if (this.checkbox.checked){
			this.button.addClassName('selected');
		}
	},
	toggle: function(){
		this.checkbox.checked = !this.checkbox.checked;
		this.button[this.checkbox.checked ? 'addClassName' : 'removeClassName']('selected');
		this.checkbox.fire('checkbox:clicked', { chechbox: this.checkbox });
	}
});
