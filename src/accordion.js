//= require "controldepo"
//= require "extensions/event.js"

CD3.Accordion = Class.create({
	initialize: function(element, options){
		element = $(element);
		this.options = options = Object.extend({
			triggers:	'.trigger',
			content:	'.content',
			event:		'click',
			selected:	'selected',
			duration:	1,
			open:		'blindDown',
			close:		'blindUp',
		}, options || {});
		
		this.trigger	= null;
		this.containers	= element.select(options.content);
		this.current	= this.containers.find(Element.visible);
		
		element.select(options.triggers).each(function(trigger, key){
			if (trigger.hasClassName(options.selected)) this.trigger = trigger;
			
			trigger.store('cd3:accordion:key', key);
		}.bind(this));
		element.delegate(options.triggers, options.event, this.activate.bind(this));
	},
	activate: function(e){
		e.stop();
				
		var options		= this.options,
			duration	= options.duration,
			trigger		= e.findElement(options.trigger),
			container	= this.containers[trigger.retrieve('cd3:accordion:key')];
		
		if (!container) return;
		
		if (this.trigger){
			this.trigger.removeClassName(options.selected);
			this.current[options.close]({duration: (duration > 0.2 ? duration - 0.2 : duration)});
		}
		
		if (container.visible()){
			this.current = null;
			this.trigger = null;
		} else {
			this.current = container[options.open]({duration: duration});
			this.trigger = trigger;
		}
	}
});
