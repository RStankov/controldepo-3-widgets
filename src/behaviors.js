//= require "header"
//= require "extensions/event.js"

/*
 * based on:
 *    Justin Palmer's EventSelectors (http://encytemedia.com/event-selectors)
 *    Dan Webb's LowPro (http://svn.danwebb.net/external/lowpro)
 */

CD3.Behaviors = (function(){
	function run(args){
		if (args.length == 1){
			var root = document, rules = args[0]; 
		} else {
			var root = $$(args[0]).first(), rules = args[1];
		}
		
		if (root) assign(root, Object.isFunction(rules) ? rules.call(root, root) : rules);
	}
	
	function assign(root, rules){
		for (var selector in rules){
			var observer = rules[selector], parts = selector.split(/:(?=[a-z]+$)/), css = parts.shift(), event = parts.join('');
			Selector.findChildElements(root, [css]).each(function(element){
				if (event){
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
		}
	}
		
	function observe(element, event, observer){
		if (Object.isFunction(observer)){
			Event.observe(element, event, observer);
		} else {
			for(var selector in observer){
				Event.delegate(element, selector, event, observer[selector]);
			}
		}
	}

	return function(){
		if (document.loaded){
			run(arguments);
		} else {
			document.observe('dom:loaded', run.curry(arguments));
		}
	};
})();

