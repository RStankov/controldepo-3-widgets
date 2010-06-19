Element.addMethods({
	// extracts id number from element(using it's id)
	// exmaple: $('test_12').extractId() -> 12
	extractId:  function(element){
		return (element.id && element.id.match(/\w+_(\d+)/)[1]) || 0;
	},
	unsetStorage: function(element){
		if (!(element = $(element))) return;
  
		if (element === window){
			delete(Element.Storage[0]);
		} else if (typeof element._prototypeUID !== "undefined") {
			var uid = element._prototypeUID[0];
			if (uid in Element.Storage)
				delete(Element.Storage[uid]);
		}
		return element;
	},
	replaceClassName: function(element, oldClassName, newClassName){
     element = $(element);
     element.className = element.className.replace(oldClassName, newClassName);
     return element;
   }
});

Element.addMethods('A', {
	request: function(element, options){
		element = $(element);
		
		if (element.hasAttribute('data-confirm') && !confirm(element.getAttribute('data-confirm'))){
			return element;
		}
		
		options = Object.extend({
		  method:       element.getAttribute('data-method') || 'get',
		  parameters:   {},
  	  evalScripts:  true
		}, options || {});
		
		if (element.hasAttribute('data-update')){
			new Ajax.Updater(element.getAttribute('data-update'), element.readAttribute('href'), options);
		} else {
			new Ajax.Request(element.readAttribute('href'), options);
		}
		
		return element;
	}
});