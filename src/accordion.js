//= require <src/header.js>

CD3.Accordion = Class.create({
	initialize: function(element, options){
		element = $(element);
		options = Object.extend({
			triggers:	'.trigger',
			content:	'.content',
			event:		'click',
			selected:	'selected',
			duration:	1
		}, options || {});
		
		this.trigger	= null;
		this.containers	= element.select(options.content);
		this.current	= this.containers.find(function(el){ return el.visible(); });
		this.options	= {selected: options.selected, duration: options.duration};
		
		element.select(options.triggers).each(function(trigger, key){
			if (trigger.hasClassName(options.selected))
				this.trigger = trigger;
			
			trigger.observe(options.event, this.activate.bind(this, key, trigger));
		}.bind(this));
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
