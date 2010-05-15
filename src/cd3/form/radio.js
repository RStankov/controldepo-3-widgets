CD3.Form.Radio = Class.create({
	initialize: function(radio){
		this.element  = $(radio).hide();
		this.name     = this.element.getAttribute('name') || this.element.identify();
		this.button   = new Element('a', {className:'radio', href:'#'}).update(' ');
		
		this.element.insert({before: this.button});
		
		// IE6 have buggy onchange event for radio buttons
		if (!this.constructor.elements[this.name]){
			this.constructor.elements[this.name] = [];
		}
		this.constructor.elements[this.name].push(this);
		
		this.element.observe('click', this.refresh.bind(this));
		this.button.observe('click', this.toggle.bind(this));
		this.refresh();
	},
	toggle: function(e){
    if (e && Object.isFunction(e.stop)) e.stop();
    
		this.element.checked = !this.element.checked;
		this.refresh();
	},
	refresh: function(){
		this.constructor.elements[this.name].each(function(object){
		  object.button[object.element.checked ? 'addClassName' : 'removeClassName']('selected');
		});
	}
});
CD3.Form.Radio.elements = {};
