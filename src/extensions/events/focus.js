(function(){
	function focusInHandler(e){
		e.element().fire("focus:in");
	}
	function focusOutHandler(e){
		e.element().fire("focus:out");
	}

	if (document.addEventListener){
		document.addEventListener("focus", focusInHandler, true);
		document.addEventListener("blur", focusOutHandler, true);
	} else {
		document.observe("focusin", focusInHandler);
		document.observe("focusout", focusOutHandler);
	}
})();