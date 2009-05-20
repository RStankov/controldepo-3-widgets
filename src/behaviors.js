//= require "header"
//= require "extentions/event.js"

/*
 * based on:
 *    Justin Palmer's EventSelectors (http://encytemedia.com/event-selectors)
 *    Dan Webb's LowPro (http://svn.danwebb.net/external/lowpro)
 */
 
CD3.Behaviors = (function(){
	function observe(element, event, observer){
		if (Object.isFunction(observer)){
			Event.observe(element, event, observer);
		} else {
			for(var selector in observer){
				Event.delegate(element, selector, event, observer[selector]);
			}
		}
	}

	function assign(root, rules){
		var selector, observer;
		for (selector in rules){
			observer = rules[selector];
			selector.split(',').each(function(selector){
				var parts = selector.split(/:(?=[a-z]+$)/), event = parts.pop(), css = parts.join('');
				Selector.findChildElements(root, [css]).each(function(element){
					if (event) {
						observe(element, event, observer);
					} else if (observer.prototype && observer.prototype.initialize){
						new observer(element);
					} else if (Object.isFunction(observer)){
						observer.call(element, element);
					} else if (Object.isArray(observer)){
						var klass = observer.shift();
						new klass(element, observer.shift());
					} else {
						for(var e in observer) observe(element, e, observer[e]);
					}
				});
			});
		}
	}

	function run(args){
		if (args.length == 1){
			var root = document, rules = args[0]; 
		} else {
			var root = $$(args[0]).first(), rules = args[1];
		}

		if (root) assign(root, Object.isFunction(rules) ? rules(root) : rules);
	}

	return function(){
		if (document.loaded){
			run(arguments);
		} else {
			document.observe('dom:loaded', run.curry(arguments));
		}
	};
})();

