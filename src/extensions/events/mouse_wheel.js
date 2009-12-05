// credits to Andrew Dupont ( http://andrewdupont.net/2007/11/07/pseudo-custom-events-in-prototype-16/ )
(function(){
	function wheel(event){
		var realDelta;

		// normalize the delta
		if (event.wheelDelta) // IE & Opera
			realDelta = event.wheelDelta / 120;
		else if (event.detail) // W3C
			realDelta = -event.detail / 3;

		if (!realDelta) return;
		
		var customEvent = Event.fire(Event.element(event), "mouse:wheel", { delta: realDelta });
		if (customEvent.stopped) Event.stop(event);
	}

	document.observe("mousewheel",     wheel);
	document.observe("DOMMouseScroll", wheel);
})();