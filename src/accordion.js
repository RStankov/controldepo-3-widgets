//= require <src/header.js>

CD3.Accordion = Class.create({
	initialize: function(element){
		element = $(element);
		
		this.options = Object.extend({
			triggers:		'.trigger',
			content:		'.content',
			event:			'click',
			duration:		1,
			selected:	'selected'
		}, arguments[1] || {});
		
		this.trigger	= null;
		this.containers	= element.select(this.options.content);
		this.current	= this.containers.find(function(el){ return el.visible(); });
		
		element.select(this.options.triggers).each(function(trigger, key){
			if (trigger.hasClassName(this.options.selected)){
				this.trigger = trigger;
			}
			
			trigger.observe(this.options.event, this.activate.bind(this, key, trigger));
		}.bind(this));
		
		delete(this.options.triggers, this.options.content, this.options.event);
	},
	activate: function(key, trigger, e){
		e.stop();
				
		var container = this.containers[key],
			duration  = this.options.duration;
		
		if (!container) return;
		
		if (this.current && this.current != container)
			this.current.blindUp({duration: (duration > 0.2 ? duration - 0.2 : duration)});
		
		if (this.trigger && this.trigger != trigger)
			this.trigger.removeClassName(this.options.selected);
		
		this.trigger = trigger.toggleClassName(this.options.selected);
		
		if (container.visible()){
			container.blindUp({duration: (duration > 0.2 ? duration - 0.2 : duration)});
			this.current = null;
		} else {
			this.current = container.blindDown({duration: duration});
		}
	}
});
