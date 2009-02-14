/* 
 * ControlDepo 3 Widgets, version 0.1
 * (c) Radoslav Stankov < Rstankov@gmail.com >
 */

var CD3 = {};

CD3.Accordion = Class.create({
	initialize: function(element){
		element = $(element);
		
		this.options = Object.extend({
			triggers:		'.trigger',
			content:		'.content',
			event:			'click',
			duration:		1,
			selected:	'selected'
		}, arguments[1] || {});
		
		this.trigger	= null;
		this.containers	= element.select(this.options.content);
		this.current	= this.containers.find(function(el){ return el.visible(); });
		
		element.select(this.options.triggers).each(function(trigger, key){
			if (trigger.hasClassName(this.options.selected)){
				this.trigger = trigger;
			}
			
			trigger.observe(this.options.event, this.activate.bind(this, key, trigger));
		}.bind(this));
		
		delete(this.options.triggers, this.options.content, this.options.event);
	},
	activate: function(key, trigger, e){
		e.stop();
				
		var container = this.containers[key],
			duration  = this.options.duration;
		
		if (!container) return;
		
		if (this.current && this.current != container)
			this.current.blindUp({duration: (duration > 0.2 ? duration - 0.2 : duration)});
		
		if (this.trigger && this.trigger != trigger)
			this.trigger.removeClassName(this.options.selected);
		
		this.trigger = trigger.toggleClassName(this.options.selected);
		
		if (container.visible()){
			container.blindUp({duration: (duration > 0.2 ? duration - 0.2 : duration)});
			this.current = null;
		} else {
			this.current = container.blindDown({duration: duration});
		}
	}
});
/*
 * based on:
 *    Justin Palmer's EventSelectors (http://encytemedia.com/event-selectors)
 *    Dan Webb's LowPro (http://svn.danwebb.net/external/lowpro)
 */

CD3.Behaviors = function(rules){
	document.observe('dom:loaded', CD3.Behaviors.assign.curry(rules, null));
}

Object.extend(CD3.Behaviors, (function(){
	function observe(element, event, observer){
		Event.observe(element, event, Object.isFunction(observer) ? observer : delegate(observer));
	}
	
	function delegate(rules){
		return function(e){
			var element = Event.element(e), elements = [element].concat(element.ancestors());
			for (var selector in rules)
				if (element = Selector.matchElements(elements, selector)[0])
					return rules[selector].call(element, e);
		}
	}
	
	return {
		assign: function(rules, parent){
			parent = parent || document;
			for (var selector in rules){
				var observer = rules[selector];
				selector.split(',').each(function(sel){
					var parts = sel.split(/:(?=[a-z]+$)/), css = parts.shift(), event = parts.join('');
					Selector.findChildElements(parent, [css]).each(function(element){
						if (event) {
							observe(element, event, observer);
						} else if (Object.isArray(observer)){
							var klass = observer.shift();
							new klass(element, observer.shift()); 
						} else if (observer.prototype && observer.prototype.initialize){
							new observer(element);
						} else if (Object.isFunction(observer)){
							observer.call(element, element);
						} else {
							for(var e in observer) observe(element, e, observer[e]);
						}
					});
				});
			}
		},
		when: function(selector, rules){
			document.observe('dom:loaded', CD3.Behaviors.assignIf.curry(selector, rules));
		},
		assignIf: function(selector, rules){
			var parent = $$(selector).first();
			if (parent) CD3.Behaviors.assign(Object.isFunction(rules) ? rules(parent) : rules, parent);
		}
	};
})());

CD3.Checkbox = Class.create({
	initialize: function(checkbox){
		this.checkbox	= $(checkbox).hide();
		this.button		= new Element('a', {className:'checkbox', href:'javascript:;'}).update(' ');
		
		this.checkbox.insert({before: this.button});
		this.button.observe('click', this.toggle.bind(this));
		
		if (this.checkbox.checked)
			this.button.addClassName('selected');
	},
	toggle: function(){
		this.checkbox.checked = !this.checkbox.checked;
		this.button[this.checkbox.checked ? 'addClassName' : 'removeClassName']('selected');
	}
});

CD3.DropDown = Class.create({
	initialize: function (container) {
		this.container	= $(container);
		this.link		= this.container.down('a.drop')
		this.div		= this.container.down('div').hide();
		this.ul			= this.container.down('ul');
		this.bindEvents();
	},
	bindEvents: function(){
		this.link.observe('click', this.toggle.bind(this));
		this.clickObserver = this.close.bind(this);
	},
	unbindEvents: function(){
		this.link.observe('click');
		document.stopObserving('click', this.clickObserver);
		this.clickObserver = Prototype.emptyFunction();
	},
	toggle: function(){
		this[this.div.visible() ? 'hide' : 'show']();
	},
	show: function(){		
		Effect.BlindDown(this.div, {duration: 0.2});
		document.observe('click', this.clickObserver);
	},
	hide: function(){
		Effect.BlindUp(this.div, {duration: 0.1});
		document.stopObserving('click', this.clickObserver);
	},
	close: function(){
		if (this.div.visible()) this.hide();
	}
});
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

Effect.FadeBlind = function(element){
	return new Effect.Parallel([Effect.BlindUp(element, {sync: true}), Effect.Fade(element, {sync: true})], arguments[1] || {});
};
Effect.AppearBlind = function(element){
	return new Effect.Parallel([Effect.BlindDown(element, {sync: true}), Effect.Appear(element, {sync: true})], arguments[1] || {});
};

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
Element.addMethods({
	extractId:  function(element){
		return (element.id && element.id.match(/\w+_(\d+)/)[1]) || 0;
	}
});

CD3.FontSwitcher = Class.create({
	initialize: function(panel, element, options){
		options = Object.extend({
			classname:	'text-size-',
			max: 		4,
			reset:		'a.reset',
			plus:		'a.plus',
			minus:		'a.minus'
		}, options || {});
		
		var buttons = {};
		
		if (options.plus)	buttons[options.plus]	= this.change.bind(this, 1);
		if (options.reset)	buttons[options.reset]	= this.change.bind(this, 0);
		if (options.minus)	buttons[options.minus]	= this.change.bind(this, -1);
	
		this.size		= 0;
		this.buttons	= buttons;
		this.maxsize	= options.max;
		this.classname	= options.classname;
		this.element	= $(element);
		this.panel		= $(panel).observe('click', this.onClick.bind(this));
		this.element.select('font[size]').each(function(font){
			font._size = parseInt(font.getAttribute('size'));
		});
	},
	onClick: function(e){
		for(var b in this.buttons)
			if (e.findElement(b))
				return this.buttons[b]();
	},
	change: function(value){
		this.element.removeClassName(this.classname + this.size);
		
		var size = value == 0 ? 0 : this.size + value;
		
		this.size = size < 0 ? 0 : ( size > this.maxsize ? this.maxsize : size );
		
		if (this.size != 0) this.element.addClassName(this.classname + this.size);
		
		size = this.size;
		this.element.select('font[size]').each(function(font){
			font.setAttribute('size', font._size + size);
		});
	}
});

CD3.Radio = Class.create({
	initialize: function(radio){
		this.radio	= $(radio).hide();
		this.name	= this.radio.getAttribute('name') || this.radio.identify();
		this.button	= new Element('a', {className:'radio', href:'javascript:;'}).update(' ');
		
		this.radio.insert({before: this.button});
		
		this.button.observe('click', this.toggle.bind(this));
		this.refresh();
		
		if (!this.constructor._elements[this.name])
			this.constructor._elements[this.name] = [];
		this.constructor._elements[this.name].push(this);
	},
	toggle: function(){
		this.radio.checked = !this.radio.checked;
		this.constructor._elements[this.name].invoke('refresh');
	},
	refresh: function(){
		this.button[this.radio.checked ? 'addClassName' : 'removeClassName']('selected');
	}
});
CD3.Radio._elements = {};

Event.wheel = function(element, callback) {
	var __onwheel = function (event) {
		var delta = 0;
		if (!event)
			event = window.event;
		if (event.wheelDelta){
			delta = event.wheelDelta/120; 
			if (window.opera) delta = -delta;
		} else if (event.detail)
			delta = -event.detail/3;
		delta = Math.round(delta, event); //Safari Round
		callback(delta);
		event.stop();
	}

	if(window.addEventListener)	// FF/DOM-Compliant Browsers
		$(element).addEventListener('DOMMouseScroll', __onwheel, false);
	else if(document.attachEvent) // IE
		$(element).observe('mousewheel', __onwheel);
};

CD3.Scroller = Class.create({
	initialize: function (container, scroller, options){
		options = this.options = Object.extend( {
			scrollSpeed:	1,
			scrollStep:		1,
			styleArrow:		'arrow',
			styleMoveUp:	'moveup',
			styleMoveDown:	'movedown',
			styleSlider:	'slider'
		}, options || {});					
		
		this.container	= $(container);
		this.scroller	= $(scroller);

		this.scroller.select('.' + options.styleArrow).each(function (el){
			el.observe('mousedown',	this.startScroll.bind(this, el));
			el.observe('mouseup',	this.stopScroll.bind(this));
			el.observe('mouseout',	this.stopScroll.bind(this));
		}.bind(this));
		
		var handle = this.handle = this.scroller.down('.' + options.styleSlider);
		
		this.sliderMaxHeight = handle.parentNode.offsetHeight - handle.offsetHeight;
			
		new Draggable(handle,{ 
			constraint: 'vertical', 
			snap: function(x, y) { return [x, this.validateTopPosition(y)]; }.bind(this),
			change: this.traceHandlePosition.bind(this),
			onStart: this.stopScroll.bind(this)
		});

		this.trackPosition = $(handle.parentNode).observe('click', this.traceSliderClick.bind(this)).cumulativeOffset();
					
		Event.wheel(this.container, this.traceMouseWheel.bind(this));
				
		this.checkIfneeded();
	},
	startScroll: function (el) {
		this.stopScroll();
		this.interval = setInterval(function (dir) { this.scrollBy(dir); }.bind(this, el.hasClassName(this.options.styleMoveUp) ? -1 : 1), 3);
	},
	stopScroll: function () {
		clearInterval(this.interval);
		this.interval = null;
	},
	scrollBy: function (dir){
		this.handle.style.top	= this.validateTopPosition( (parseInt(this.handle.style.top) || 0) + dir ) + 'px';
		this.traceHandlePosition();
	},
	setHandlePosition: function() {
		var container			= this.container;
		this.handle.style.top	= (this.sliderMaxHeight * (container.scrollTop / (container.scrollHeight - container.offsetHeight))) + 'px';
	},
	validateTopPosition: function(y) {
		if (y <= 0) return 0;
		if (y >= this.sliderMaxHeight) return this.sliderMaxHeight;
		
		return y;
	},
	traceHandlePosition: function (){
		var scroll					= parseInt(this.handle.getStyle('top')) || 0;
		var container				= this.container;
		this.container.scrollTop	= (container.scrollHeight - container.offsetHeight) * (scroll/this.sliderMaxHeight);
	},
	traceMouseWheel: function(delta){
		this.stopScroll();
		if (delta != 0)
			this.scrollBy((delta > 0 ? -1 : 1) * 15);			
	},
	traceSliderClick: function(e){
		var clickedY = e.pointerY()  - this.trackPosition[1],
			top = parseInt(this.handle.style.top) || 0,
			height = this.handle.getHeight();

		if (clickedY < top || (top+height) < clickedY)
			new Effect.Morph(this.handle, {
				style:		 	{ top : this.validateTopPosition(clickedY) + 'px'},
				duration:	 	0.5,
				afterUpdate:	this.traceHandlePosition.bind(this),
				queue:			{scope: 'scroller', limit:1}
			});
	},
	checkIfneeded: function(){
		this.scroller[this.container.scrollHeight <= this.container.offsetHeight ? 'hide' : 'show']();
	}
});

CD3.Select = Class.create(CD3.DropDown, {
	initialize: function(select){		
		select = $(select);
		
		this.container	= new Element('span', {className:'dropper'});
		this.link		= new Element('a', {href: 'javascript:;', className: 'drop'})
		this.linkspan	= new Element('span').update(select.selectedIndex > -1 ? select.options[select.selectedIndex || 0].text : '');
		this.hidden		= new Element('input', {type: 'hidden', name: select.name, value: select.getValue()});
		this.div		= new Element('div').hide();
		this.ul			= new Element('ul');
		
		if (select.className)
			this.container.addClassName(select.className);
		
		select.insert({
			 before: this.container
				.insert(this.link.insert(this.linkspan))
				.insert(this.hidden)
				.insert(this.div.insert(this.ul))
		});
		
		var options = Object.extend({
			onChange: null,
			topBottom: false,
			reference: false
		}, arguments[1] || {});

		if (options.topBottom)
			this.ul.insert({
				before:	new Element('span', {className: 'top'}).insert(new Element('span')),
				after:	new Element('span', {className: 'bottom'}).insert(new Element('span'))
			});
			
		if (options.onChange) this.onChange = options.onChange;
		
		if ($A(select.options).each(this.addOption.bind(this)).length > 6)
			this.div.addClassName('scrolled');
		
		if (options.reference)
			this.constructor.instances[Object.isString(options.reference) ? options.reference : select.name] = this;
		
		Element.remove(select);
		
		this.bindEvents();
	},
	destroy: function(){
		this.unbindEvents();
		this.removeOptions();
		this.container.remove();
	},
	addOption: function (option){
		this.ul.insert(new Element('li').insert(
			new Element('a', {href: 'javascript:;'}).update(option.text).observe('click', this.select.bind(this, option))
		));
	},
	removeOptions: function(){
		this.ul.select('li').each(function(li){
			li.down('a').stopObserving('click');
			li.remove();
		});
	},
	setOptions: function(options, dontClear){
		if (dontClear !== true) this.removeOptions();

		$A(options).each(this.addOption.bind(this));

		if (dontClear !== true) this.select(options[0]);
	},
	select: function(option){
		this.linkspan.innerHTML = option.text;
		this.hidden.value		= option.value != null ? option.value : option.text;
		this.hide();
		
		if (this.onChange)
			this.onChange.call(this, option.value);
	}
});

CD3.Select.instances = {};
