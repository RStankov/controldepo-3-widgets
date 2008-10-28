Effect.Mutate = function(from, into){
	from = $(from);
	from.absolutize();
	from.makeClipping();
	from.insert({before: $(into) || into});
	
	into = from.previous();
	
	var style = 'width: ' + into.getWidth() + 'px; height: ' + into.getHeight() + 'px;';
	
	into.setStyle({ width: from.getWidth() + 'px', height: from.getHeight() + 'px' });
	into.makeClipping();
	into.setOpacity(0.0);
	into.show();
	
	return new Effect.Parallel([
		new Effect.Opacity(from,	{sync: true, from: from.getOpacity() || 1.0,	to: 0.0}),
		new Effect.Opacity(into,	{sync: true, from: 0.0, 						to: 1.0}),
		new Effect.Morph(from,		{sync: true, style: style}),
		new Effect.Morph(into,		{sync: true, style: style})
	], Object.extend({
		afterFinishInternal: function(e){
			into.undoClipping();
			into.style.width = null;
			into.style.height = null;
			into = null;
			
			if (e.options.repace){
				from.remove();
				from = null;
				return;
			}
			
			from.relativize();
			from.undoClipping();
			from.hide();
		}
	}, arguments[2] || {}));
};

Element.addMethods({
	mutateTo: function(element, into, options){
		Effect.Mutate($(element), into, options)
		return element;
	}
});