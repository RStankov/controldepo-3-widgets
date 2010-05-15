CD3.Form.Checkbox = Class.create({
  initialize: function(element){
    this.element	= $(element).hide();
    this.button		= new Element('a', {className:'checkbox', href:'#'}).update(' ');

    this.element.insert({before: this.button});
    
    this.element.observe('change', this.clicked.bind(this));
    this.button.observe('click', this.toggle.bind(this));

    if (this.element.className.length > 0){
      this.button.addClassName(this.element.className);
    }

    if (this.element.checked){
      this.button.addClassName('selected');
    }
  },
  toggle: function(e){
    if (e && Object.isFunction(e.stop)) e.stop();
    
    this.element.checked = !this.element.checked;
    this.clicked();
  },
  clicked: function(){
    this.button[this.element.checked ? 'addClassName' : 'removeClassName']('selected');
    this.element.fire('checkbox:clicked', { chechbox: this.element });
  }
});
