Element.addMethods({
	// extracts id number from element(using it's id)
	// exmaple: $('test_12').extractId() -> 12
	extractId:  function(element){
		return (element.id && element.id.match(/\w+_(\d+)/)[1]) || 0;
	}
});
