CD3.Widget.DropDown = CD3.Widget.create('CD3.Widget.DropDown', {
  trigger: '.drop',
  menu:    'div'
}, {
	setup: function (){
	  this.trigger = this.element.down(this.options.trigger);
	  this.menu    = this.element.down(this.options.menu).hide();
	},
	addObservers: function(){
	  this.documentObserver = new Event.Handler(document, 'click', null, this.hide.bind(this));
	  this.documentObserver.start = this.documentObserver.start.bind(this.documentObserver)
	  this.observers = [
	    this.trigger.on('click', this.toggle.bind(this)),
	    this.documentObserver
	  ];
	},
	toggle: function(e){
	  if (e && Object.isFunction(e.stop)){
	    e.stop();
	    
		this[this.menu.visible() ? 'hide' : 'show']();
	},
	show: function(){
	  if (!this.menu.visible()){
		  this.menu.show();
		  this.documentObserver.start.defer();
	  }
	},
	hide: function(){
	  if (this.menu.visible()){
		  this.menu.hide();
		  this.documentObserver.stop();
	  }
	}
});
