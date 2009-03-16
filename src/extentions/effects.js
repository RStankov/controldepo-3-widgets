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
		new Effect.Morph(from, {sync: true, style: style + 'opacity: 0.0;'}),
		new Effect.Morph(into, {sync: true, style: style + 'opacity: 1.0;'})
	], Object.extend({
		afterFinishInternal: function(e){
			into.undoClipping();
			into.style.width = null;
			into.style.height = null;
			into = null;
			
			if (e.options.replace){
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

Effect.FadeBlind = function(element){
	return new Effect.Parallel([Effect.BlindUp(element, {sync: true}), Effect.Fade(element, {sync: true})], arguments[1] || {});
};
Effect.AppearBlind = function(element){
	return new Effect.Parallel([Effect.BlindDown(element, {sync: true}), Effect.Appear(element, {sync: true})], arguments[1] || {});
};

// enable Effect.toggle(element, 'fading_blind');
Effect.PAIRS['fading_blind'] = ['AppearBlind', 'FadeBlind'];

Element.addMethods({
		fadeBlind: function(element, options){
		element = $(element);
		Effect.FadeBlind(element, options);
		return element;
	},
		appearBlind: function(element, options){
		element = $(element);
		Effect.AppearBlind(element, options);
		return element;
	},
	mutateTo: function(element, into, options){
		element = $(element)
		Effect.Mutate(element, into, options)
		return element;
	}
});
