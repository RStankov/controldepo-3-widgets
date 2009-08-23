CD3.DropDown = Class.create({
	initialize: function (container) {
		this.container	= $(container);
		this.link		= this.container.down('a.drop')
		this.div		= this.container.down('div').hide();
		this.ul			= this.container.down('ul');
		this.bindEvents();
	},
	bindEvents: function(){
		this.link.observe('click', this.toggle.bind(this));
		this.clickObserver = this.close.bind(this);
	},
	unbindEvents: function(){
		this.link.observe('click');
		document.stopObserving('click', this.clickObserver);
		this.clickObserver = Prototype.emptyFunction();
	},
	toggle: function(){
		this[this.div.visible() ? 'hide' : 'show']();
	},
	show: function(){		
		Effect.BlindDown(this.div, {duration: 0.2});
		document.observe('click', this.clickObserver);
	},
	hide: function(){
		Effect.BlindUp(this.div, {duration: 0.1});
		document.stopObserving('click', this.clickObserver);
	},
	close: function(){
		if (this.div.visible()) this.hide();
	}
});
