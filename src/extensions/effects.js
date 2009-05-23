Effect.Mutate = function(from, into){
	from = $(from);
	from.insert({after: $(into) || into});
	
	into = from.next();
	
	var style		= '',
		fromWidth	= from.getWidth(),
		fromHeight	= from.getHeight(),
		intoWidth	= into.getWidth(),
		intoHeight	= into.getHeight();
	
	if (fromWidth != intoWidth)		style += 'width: ' + intoWidth + 'px; ';
	if (fromHeight != intoHeight)	style += 'height: ' + intoHeight + 'px; ';
	
	return new Effect.Parallel([
		new Effect.Morph(from, {sync: true, style: style + 'opacity: 0.0;'}),
		new Effect.Morph(into, {sync: true, style: style + 'opacity: 1.0;'})
	], Object.extend({
		beforeStartInternal: function(){
			from.absolutize();
			from.makeClipping();
			
			into.setStyle({width: fromWidth + 'px', height: fromHeight + 'px' });
			into.makeClipping();
			into.setOpacity(0.0);
			into.show();
		},
		afterFinishInternal: function(e){
			into.undoClipping();
			into.style.width = null;
			into.style.height = null;
			into = null;
			
			if (e.options.replace){
				from.remove();
				from = null;
			} else {
				from.relativize();
				from.undoClipping();
				from.style.width = null;
				from.style.height = null;
				from.hide();
			}
		}
	}, arguments[2] || { replace: false }));
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
	},
	removeWithEffect: function(element, effect, options){
		element = $(element);
		options = options || {};
		
		options.afterFinish = 'afterFinish' in options ? 
			options.afterFinish.wrap(function(callback, e){ callback(e); element.remove(); }) : 
			function(){ element.remove(); };
		
		effect = effect.camelize();
		effect = effect.charAt(0).toUpperCase() + effect.substring(1);
		effect = Effect[effect];
		
		if (effect.prototype.initialize){
			new effect(element, options);
		} else {
			effect(element, options);
		}
		
		return element;
	}
});
