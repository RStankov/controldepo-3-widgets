//= require <src/header.js>

/*
 * based on:
 *    Justin Palmer's EventSelectors (http://encytemedia.com/event-selectors)
 *    Dan Webb's LowPro (http://svn.danwebb.net/external/lowpro)
 */
 
CD3.Behaviors = function(rules){
	document.observe('dom:loaded', CD3.Behaviors.assign.curry(rules, null));
}

Object.extend(CD3.Behaviors, (function(){
	function observe(element, event, observer){
		if (Object.isFunction(observer)){
			Event.observe(element, event, observer);
		} else {
			for(var selector in observer){
				Event.delegate(element, selector, event, observer[selector]);
			}
		}
	}
	return {
		assign: function(rules, parent){
			parent = parent || document;
			for (var selector in rules){
				var observer = rules[selector];
				selector.split(',').each(function(sel){
					var parts = sel.split(/:(?=[a-z]+$)/), css = parts.shift(), event = parts.join('');
					Selector.findChildElements(parent, [css]).each(function(element){
						if (event) {
							observe(element, event, observer);
						} else if (Object.isArray(observer)){
							var klass = observer.shift();
							new klass(element, observer.shift()); 
						} else if (observer.prototype && observer.prototype.initialize){
							new observer(element);
						} else if (Object.isFunction(observer)){
							observer.call(element, element);
						} else {
							for(var e in observer) observe(element, e, observer[e]);
						}
					});
				});
			}
		},
		when: function(selector, rules){
			document.observe('dom:loaded', CD3.Behaviors.assignIf.curry(selector, rules));
		},
		assignIf: function(selector, rules){
			var parent = $$(selector).first();
			if (parent) CD3.Behaviors.assign(Object.isFunction(rules) ? rules(parent) : rules, parent);
		}
	};
})());
