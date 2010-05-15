CD3.Widget.DropDown = CD3.Widget.create('CD3.Widget.DropDown', {
  trigger: '.drop',
  menu: 'div'
}, {
	setup: function (){
	  this.trigger = this.element.down(this.options.trigger);
	  this.menu    = this.element.down(this.options.menu).hide();
	},
	addObservers: function(){
	  this.documentObserver = new Event.Handler(document, 'click', null, this.close.bind(this));
	  this.documentObserver.start = this.documentObserver.start.bind(this.documentObserver)
	  this.observers = [
	    this.open.on('click', this.toggle.bind(this)),
	    this.documentObserver
	  ];
	},
	toggle: function(){
		this[this.menu.visible() ? 'hide' : 'show']();
	},
	show: function(){
		this.menu.show();
		this.documentObserver.start.defer();
	},
	hide: function(){
		this.menu.hide();
		this.documentObserver.stop();
	},
	close: function(){
		if (this.menu.visible()) this.hide();
	}
});
