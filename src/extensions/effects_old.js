Effect.Mutate = function(from, into){
	from = $(from);
	from.makeClipping();
	from.absolutize();
	from.insert({after: $(into) || into});
	
	into = from.next();
	into.makeClipping();
	into.setOpacity(0.0);
	into.show();
	
	var style	= '',
		options	= Object.extend({ replace: false, resize: true }, arguments[2] || {})
	
	if (options.resize){
		var	fromDim = from.getDimensions(),
			intoDim = into.getDimensions();
	
		if (fromDim.width  != intoDim.width)  style += 'width: '  + intoDim.width  + 'px; ';
		if (fromDim.height != intoDim.height) style += 'height: ' + intoDim.height + 'px; ';
		
		into.setStyle({width: fromDim.width + 'px', height: fromDim.height + 'px' });
	}

	return new Effect.Parallel([
		new Effect.Morph(from, {sync: true, style: style + 'opacity: 0.0;'}),
		new Effect.Morph(into, {sync: true, style: style + 'opacity: 1.0;'})
	], Object.extend(options, {
		afterFinishInternal: function(e){
			into.undoClipping();
			into = null;
			
			if (e.options.replace){
				from.remove();
				from = null;
			} else {
				from.relativize();
				from.undoClipping();
				from.hide();
			}
		}
	}));
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
