/*!
 *  script.aculo.us version 2.0.0_a6
 *  (c) 2005-2010 Thomas Fuchs
 *
 *  script.aculo.us is freely distributable under the terms of an MIT-style license.
 *----------------------------------------------------------------------------------*/



var S2 = {
  Version: '2.0.0_a6',

  Extensions: {}
};


Function.prototype.optionize = function(){
  var self = this, argumentNames = self.argumentNames(), optionIndex = this.length - 1;

  var method = function() {
    var args = $A(arguments);

    var options = (typeof args.last() === 'object') ? args.pop() : {};
    var prefilledArgs = [];
    if (optionIndex > 0) {
      prefilledArgs = ((args.length > 0 ? args : [null]).inGroupsOf(
       optionIndex).flatten()).concat(options);
    }

    return self.apply(this, prefilledArgs);
  };
  method.argumentNames = function() { return argumentNames; };
  return method;
};

Function.ABSTRACT = function() {
  throw "Abstract method. Implement in subclass.";
};

Object.extend(Number.prototype, {
  constrain: function(n1, n2) {
    var min = (n1 < n2) ? n1 : n2;
    var max = (n1 < n2) ? n2 : n1;

    var num = Number(this);

    if (num < min) num = min;
    if (num > max) num = max;

    return num;
  },

  nearer: function(n1, n2) {
    var num = Number(this);

    var diff1 = Math.abs(num - n1);
    var diff2 = Math.abs(num - n2);

    return (diff1 < diff2) ? n1 : n2;
  },

  tween: function(target, position) {
    return this + (target-this) * position;
  }
});


Object.propertize = function(property, object){
  return Object.isString(property) ? object[property] : property;
};

S2.CSS = {
  PROPERTY_MAP: {
    backgroundColor: 'color',
    borderBottomColor: 'color',
    borderBottomWidth: 'length',
    borderLeftColor: 'color',
    borderLeftWidth: 'length',
    borderRightColor: 'color',
    borderRightWidth: 'length',
    borderSpacing: 'length',
    borderTopColor: 'color',
    borderTopWidth: 'length',
    bottom: 'length',
    color: 'color',
    fontSize: 'length',
    fontWeight: 'integer',
    height: 'length',
    left: 'length',
    letterSpacing: 'length',
    lineHeight: 'length',
    marginBottom: 'length',
    marginLeft: 'length',
    marginRight: 'length',
    marginTop: 'length',
    maxHeight: 'length',
    maxWidth: 'length',
    minHeight: 'length',
    minWidth: 'length',
    opacity: 'number',
    outlineColor: 'color',
    outlineOffset: 'length',
    outlineWidth: 'length',
    paddingBottom: 'length',
    paddingLeft: 'length',
    paddingRight: 'length',
    paddingTop: 'length',
    right: 'length',
    textIndent: 'length',
    top: 'length',
    width: 'length',
    wordSpacing: 'length',
    zIndex: 'integer',
    zoom: 'number'
  },

  LENGTH: /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/,

  NUMBER: /([\+-]*\d+\.?\d*)/,

  __parseStyleElement: document.createElement('div'),

  parseStyle: function(styleString) {
    S2.CSS.__parseStyleElement.innerHTML = '<div style="' + styleString + '"></div>';
    var style = S2.CSS.__parseStyleElement.childNodes[0].style, styleRules = {};

    S2.CSS.NUMERIC_PROPERTIES.each( function(property){
      if (style[property]) styleRules[property] = style[property];
    });

    S2.CSS.COLOR_PROPERTIES.each( function(property){
      if (style[property]) styleRules[property] = S2.CSS.colorFromString(style[property]);
    });

    if (Prototype.Browser.IE && styleString.include('opacity'))
      styleRules.opacity = styleString.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1];

    return styleRules;
  },

  normalizeColor: function(color) {
    if (!color || color == 'rgba(0, 0, 0, 0)' || color == 'transparent') color = '#ffffff';
    color = S2.CSS.colorFromString(color);
    return [
      parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)
    ];
  },

  colorFromString: function(color) {
    var value = '#', cols, i;
    if (color.slice(0,4) == 'rgb(') {
      cols = color.slice(4,color.length-1).split(',');
      i=3; while(i--) value += parseInt(cols[2-i]).toColorPart();
    } else if (color.slice(0,1) == '#') {
        if (color.length==4) for(i=1;i<4;i++) value += (color.charAt(i) + color.charAt(i)).toLowerCase();
        if (color.length==7) value = color.toLowerCase();
    } else { value = color; }
    return (value.length==7 ? value : (arguments[1] || value));
  },

  interpolateColor: function(from, to, position){
    from = S2.CSS.normalizeColor(from);
    to = S2.CSS.normalizeColor(to);

    return '#' + [0,1,2].map(function(index){
      return Math.max(Math.min(from[index].tween(to[index], position).round(), 255), 0).toColorPart();
    }).join('');
  },

  interpolateNumber: function(from, to, position){
    return 1*((from||0).tween(to, position).toFixed(3));
  },

  interpolateLength: function(from, to, position){
    if (!from || parseFloat(from) === 0) {
      from = '0' + to.gsub(S2.CSS.NUMBER,'');
    }
    to.scan(S2.CSS.NUMBER, function(match){ to = 1*(match[1]); });
    return from.gsub(S2.CSS.NUMBER, function(match){
      return (1*(parseFloat(match[1]).tween(to, position).toFixed(3))).toString();
    });
  },

  interpolateInteger: function(from, to, position){
    return parseInt(from).tween(to, position).round();
  },

  interpolate: function(property, from, to, position){
    return S2.CSS['interpolate'+S2.CSS.PROPERTY_MAP[property.camelize()].capitalize()](from, to, position);
  },

  ElementMethods: {
    getStyles: function(element) {
      var css = document.defaultView.getComputedStyle($(element), null);
      return S2.CSS.PROPERTIES.inject({ }, function(styles, property) {
        styles[property] = css[property];
        return styles;
      });
    }
  }
};

S2.CSS.PROPERTIES = [];
for(property in S2.CSS.PROPERTY_MAP) S2.CSS.PROPERTIES.push(property);

S2.CSS.NUMERIC_PROPERTIES = S2.CSS.PROPERTIES.findAll(function(property){ return !property.endsWith('olor') });
S2.CSS.COLOR_PROPERTIES   = S2.CSS.PROPERTIES.findAll(function(property){ return property.endsWith('olor') });

if (!(document.defaultView && document.defaultView.getComputedStyle)) {
  S2.CSS.ElementMethods.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = S2.CSS.PROPERTIES.inject({ }, function(hash, property) {
      hash[property] = css[property];
      return hash;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
};

Element.addMethods(S2.CSS.ElementMethods);

S2.FX = (function(){
  var queues = [], globalQueue,
    heartbeat, activeEffects = 0;

  function beatOnDemand(dir){
    heartbeat[(activeEffects += dir) > 0 ? 'start' : 'stop']();
  }

  function renderQueues(){
    queues.invoke('render', heartbeat.getTimestamp());
  }

  function initialize(initialHeartbeat){
    if(globalQueue) return;
    queues.push(globalQueue = new S2.FX.Queue());
    S2.FX.DefaultOptions.queue = globalQueue;
    heartbeat = initialHeartbeat || new S2.FX.Heartbeat();

    document
      .observe('effect:heartbeat', renderQueues)
      .observe('effect:queued',    beatOnDemand.curry(1))
      .observe('effect:dequeued',  beatOnDemand.curry(-1));
  }

  return {
    initialize: initialize,
    getQueues: function(){ return queues; },
    addQueue: function(queue){ queues.push(queue); },
    getHeartbeat: function(){ return heartbeat; },
    setHeartbeat: function(newHeartbeat){
      heartbeat = newHeartbeat;
    }
  }
})();

Object.extend(S2.FX, {
  DefaultOptions: {
    transition: 'sinusoidal',
    position:   'parallel',
    fps:        60,
    duration:   .2
  },

  elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },

  parseOptions: function(options) {
    if (Object.isNumber(options))
      options = { duration: options };
    else if (Object.isFunction(options))
      options = { after: options };
    else if (Object.isString(options))
      options = { duration: options == 'slow' ? 1 : options == 'fast' ? .1 : .2 };

    return options || {};
  }
});

S2.FX.Base = Class.create({
  initialize: function(options) {
    S2.FX.initialize();
    this.updateWithoutWrappers = this.update;

    if(options && options.queue && !S2.FX.getQueues().include(options.queue))
      S2.FX.addQueue(options.queue);

    this.setOptions(options);
    this.duration = this.options.duration*1000;
    this.state = 'idle';

    ['after','before'].each(function(method) {
      this[method] = function(method) {
        method(this);
        return this;
      }
    }, this);
  },

  setOptions: function(options) {
    options = S2.FX.parseOptions(options);

    if (!this.options) {
      this.options = Object.extend(Object.extend({},S2.FX.DefaultOptions), options);
      if(options.tween) this.options.transition = options.tween;
    }

    if (this.options.beforeUpdate || this.options.afterUpdate) {
      this.update = this.updateWithoutWrappers.wrap( function(proceed,position){
        if (this.options.beforeUpdate) this.options.beforeUpdate(this, position);
        proceed(position);
        if (this.options.afterUpdate) this.options.afterUpdate(this, position);
      }.bind(this));
    }
    if(this.options.transition === false)
      this.options.transition = S2.FX.Transitions.linear;
    this.options.transition = Object.propertize(this.options.transition, S2.FX.Transitions);
  },

  play: function(options) {
    this.setOptions(options);
    this.frameCount = 0;
    this.options.queue.add(this);
    this.maxFrames = this.options.fps * this.duration / 1000;
    return this;
  },

  render: function(timestamp) {
    if (timestamp >= this.startsAt) {
      if (this.state == 'idle') {
        if (this.options.before) this.options.before(this);
        if (this.setup) this.setup();
        this.state = 'running';
        this.update(this.options.transition(0));
        this.frameCount++;
        return this;
      }
      if (timestamp >= this.endsAt && !(this.state == 'finished')) {
        this.update(this.options.transition(1));
        if (this.teardown) this.teardown();
        if (this.options.after) this.options.after(this);
        this.state = 'finished';
      } else if (this.state == 'running') {
        var position = 1 - (this.endsAt - timestamp) / this.duration;
        if ((this.maxFrames * position).floor() > this.frameCount) {
          this.update(this.options.transition(position));
          this.frameCount++;
        }
      }
    }
    return this;
  },

  cancel: function(after) {
    if(!this.state == 'running') return;
    if (this.teardown) this.teardown();
    if (after && this.options.after) this.options.after(this);
    this.state = 'finished';
  },

  finish: function(after) {
    if(!this.state == 'running') return;
    this.update(this.options.transition(1));
    this.cancel(true);
  },

  inspect: function() {
    return '#<S2.FX:' + [this.state, this.startsAt, this.endsAt].inspect() + '>';
  },

  update: Prototype.emptyFunction
});

S2.FX.Element = Class.create(S2.FX.Base, {
  initialize: function($super, element, options) {
    if(!(this.element = $(element)))
      throw(S2.FX.elementDoesNotExistError);
    this.operators = [];
    return $super(options);
  },

  animate: function() {
    var args = $A(arguments), operator =  args.shift();
    operator = operator.charAt(0).toUpperCase() + operator.substring(1);
    this.operators.push(new S2.FX.Operators[operator](this, args[0], args[1] || {}));
  },

  play: function($super, element, options) {
    if (element) this.element = $(element);
    return $super(options);
  },

  update: function(position) {
    this.operators.invoke('render', position);
  }
});
S2.FX.Heartbeat = Class.create({
  initialize: function(options) {
    this.options = Object.extend({
      framerate: Prototype.Browser.MobileSafari ? 20 : 60
    }, options);
    this.beat = this.beat.bind(this);
  },

  start: function() {
    if (this.heartbeatInterval) return;
    this.heartbeatInterval =
      setInterval(this.beat, 1000/this.options.framerate);
    this.updateTimestamp();
  },

  stop: function() {
    if (!this.heartbeatInterval) return;
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
    this.timestamp = null;
  },

  beat: function() {
    this.updateTimestamp();
    document.fire('effect:heartbeat');
  },

  getTimestamp: function() {
    return this.timestamp || this.generateTimestamp();
  },

  generateTimestamp: function() {
    return new Date().getTime();
  },

  updateTimestamp: function() {
    this.timestamp = this.generateTimestamp();
  }
});
S2.FX.Queue = (function(){
  return function(){
    var effects = [];

    function getEffects(){
      return effects;
    }

    function active(){
      return effects.length > 0;
    }

    function add(effect){
      calculateTiming(effect);
      effects.push(effect);
      document.fire('effect:queued', this);
      return this;
    }

    function remove(effect){
      effects = effects.without(effect);
      delete effect;
      document.fire('effect:dequeued', this);
      return this;
    }

    function render(timestamp){
      effects.invoke('render', timestamp);
      effects.select(function(effect) {
        return effect.state == 'finished';
      }).each(remove);
      return this;
    }

    function calculateTiming(effect){
      var position = effect.options.position || 'parallel',
        startsAt = S2.FX.getHeartbeat().getTimestamp();

      if (position == 'end')
        startsAt = effects.without(effect).pluck('endsAt').max() || startsAt;

      effect.startsAt =
        startsAt + (effect.options.delay || 0) * 1000;
      effect.endsAt =
        effect.startsAt + (effect.options.duration || 1) * 1000;
    }

    Object.extend(this, {
      getEffects: getEffects,
      active: active,
      add: add,
      remove: remove,
      render: render
    });
  }
})();

S2.FX.Attribute = Class.create(S2.FX.Base, {
  initialize: function($super, object, from, to, options, method) {
    object = Object.isString(object) ? $(object) : object;

    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };

    this.to = to;
    this.from = from;

    return $super(options);
  },

  update: function(position) {
    this.method(this.from.tween(this.to, position));
  }
});
S2.FX.Style = Class.create(S2.FX.Element, {
  setup: function() {
    this.animate('style', this.element, { style: this.options.style });
  }
});
S2.FX.Operators = { };

S2.FX.Operators.Base = Class.create({
  initialize: function(effect, object, options) {
    this.effect = effect;
    this.object = object;
    this.options = Object.extend({
      transition: Prototype.K
    }, options);
  },

  inspect: function() {
    return "#<S2.FX.Operators.Base:" + this.lastValue + ">";
  },

  setup: function() {
  },

  valueAt: function(position) {
  },

  applyValue: function(value) {
  },

  render: function(position) {
    var value = this.valueAt(this.options.transition(position));
    this.applyValue(value);
    this.lastValue = value;
  }
});

S2.FX.Operators.Style = Class.create(S2.FX.Operators.Base, {
  initialize: function($super, effect, object, options) {
    $super(effect, object, options);
    this.element = $(this.object);

    this.style = Object.isString(this.options.style) ?
      S2.CSS.parseStyle(this.options.style) : this.options.style;

    var translations = this.options.propertyTransitions || {};

    this.tweens = [];
    for(var item in this.style){
      var property = item.underscore().dasherize(),
        from = this.element.getStyle(property), to = this.style[item];

      if(from!=to)
        this.tweens.push([
          property,
          S2.CSS.interpolate.curry(property, from, to),
          item in translations ? Object.propertize(translations[item], S2.FX.Transitions) : Prototype.K
        ]);
    }
  },

  valueAt: function(position) {
    return this.tweens.map( function(tween){
      return tween[0]+':'+tween[1](tween[2](position));
    }).join(';')
  },

  applyValue: function(value) {
    if(this.currentStyle == value) return;
    this.element.setStyle(value);
    this.currentStyle = value;
  }
});

S2.FX.Morph = Class.create(S2.FX.Element, {
  setup: function() {
    if (this.options.change)
      this.setupWrappers();
    else if (this.options.style)
      this.animate('style', this.destinationElement || this.element, {
        style: this.options.style,
        propertyTransitions: this.options.propertyTransitions || { }
      });
  },

  teardown: function() {
    if (this.options.change)
      this.teardownWrappers();
  },

  setupWrappers: function() {
    var elementFloat = this.element.getStyle("float"),
      sourceHeight, sourceWidth,
      destinationHeight, destinationWidth,
      maxHeight;

    this.transitionElement = new Element('div').setStyle({ position: "relative", overflow: "hidden", 'float': elementFloat });
    this.element.setStyle({ 'float': "none" }).insert({ before: this.transitionElement });

    this.sourceElementWrapper = this.element.cloneWithoutIDs().wrap('div');
    this.destinationElementWrapper = this.element.wrap('div');

    this.transitionElement.insert(this.sourceElementWrapper).insert(this.destinationElementWrapper);

    sourceHeight = this.sourceElementWrapper.getHeight();
    sourceWidth = this.sourceElementWrapper.getWidth();

    this.options.change();

    destinationHeight = this.destinationElementWrapper.getHeight();
    destinationWidth  = this.destinationElementWrapper.getWidth();

    this.outerWrapper = new Element("div");
    this.transitionElement.insert({ before: this.outerWrapper });
    this.outerWrapper.setStyle({
      overflow: "hidden", height: sourceHeight + "px", width: sourceWidth + "px"
    }).appendChild(this.transitionElement);

    maxHeight = Math.max(destinationHeight, sourceHeight), maxWidth = Math.max(destinationWidth, sourceWidth);

    this.transitionElement.setStyle({ height: sourceHeight + "px", width: sourceWidth + "px" });
    this.sourceElementWrapper.setStyle({ position: "absolute", height: maxHeight + "px", width: maxWidth + "px", top: 0, left: 0 });
    this.destinationElementWrapper.setStyle({ position: "absolute", height: maxHeight + "px", width: maxWidth + "px", top: 0, left: 0, opacity: 0, zIndex: 2000 });

    this.outerWrapper.insert({ before: this.transitionElement }).remove();

    this.animate('style', this.transitionElement, { style: 'height:' + destinationHeight + 'px; width:' + destinationWidth + 'px' });
    this.animate('style', this.destinationElementWrapper, { style: 'opacity: 1.0' });
  },

  teardownWrappers: function() {
    var destinationElement = this.destinationElementWrapper.down();

    if (destinationElement)
      this.transitionElement.insert({ before: destinationElement });

    this.transitionElement.remove();
  }
});
S2.FX.Parallel = Class.create(S2.FX.Base, {
  initialize: function($super, effects, options) {
    this.effects = effects || [];
    return $super(options || {});
  },

  setup: function() {
    this.effects.invoke('setup');
  },

  update: function(position) {
    this.effects.invoke('update', position);
  }
});

S2.FX.Operators.Scroll = Class.create(S2.FX.Operators.Base, {
  initialize: function($super, effect, object, options) {
    $super(effect, object, options);
    this.start = object.scrollTop;
    this.end = this.options.scrollTo;
  },

  valueAt: function(position) {
    return this.start + ((this.end - this.start)*position);
  },

  applyValue: function(value){
    this.object.scrollTop = value.round();
  }
});

S2.FX.Scroll = Class.create(S2.FX.Element, {
  setup: function() {
    this.animate('scroll', this.element, { scrollTo: this.options.to });
  }
});


S2.FX.SlideDown = Class.create(S2.FX.Element, {
  setup: function() {
    var element = this.destinationElement || this.element;
    var layout = element.getLayout();

    var style = {
      height:        layout.get('height') + 'px',
      paddingTop:    layout.get('padding-top') + 'px',
      paddingBottom: layout.get('padding-bottom') + 'px'
    };

    element.setStyle({
      height:         '0',
      paddingTop:     '0',
      paddingBottom:  '0',
      overflow:       'hidden'
    }).show();

    this.animate('style', element, {
      style: style,
      propertyTransitions: {}
    });
  },

  teardown: function() {
    var element = this.destinationElement || this.element;
    element.setStyle({
      height:         '',
      paddingTop:     '',
      paddingBottom:  '',
      overflow:       'visible'
    });
  }
});

S2.FX.SlideUp = Class.create(S2.FX.Morph, {
  setup: function() {
    var element = this.destinationElement || this.element;
    var layout = element.getLayout();

    var style = {
      height:        '0px',
      paddingTop:    '0px',
      paddingBottom: '0px'
    };

    element.setStyle({ overflow: 'hidden' });

    this.animate('style', element, {
      style: style,
      propertyTransitions: {}
    });
  },

  teardown: function() {
    var element = this.destinationElement || this.element;
    element.setStyle({
      height:         '',
      paddingTop:     '',
      paddingBottom:  '',
      overflow:       'visible'
    }).hide();
  }
});


S2.FX.Transitions = {

  linear: Prototype.K,

  sinusoidal: function(pos) {
    return (-Math.cos(pos*Math.PI)/2) + 0.5;
  },

  reverse: function(pos) {
    return 1 - pos;
  },

  mirror: function(pos, transition) {
    transition = transition || S2.FX.Transitions.sinusoidal;
    if(pos<0.5)
      return transition(pos*2);
    else
      return transition(1-(pos-0.5)*2);
  },

  flicker: function(pos) {
    var pos = pos + (Math.random()-0.5)/5;
    return S2.FX.Transitions.sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
  },

  wobble: function(pos) {
    return (-Math.cos(pos*Math.PI*(9*pos))/2) + 0.5;
  },

  pulse: function(pos, pulses) {
    return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
  },

  blink: function(pos, blinks) {
    return Math.round(pos*(blinks||5)) % 2;
  },

  spring: function(pos) {
    return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
  },

  none: Prototype.K.curry(0),

  full: Prototype.K.curry(1)
};

/*!
 *  Copyright (c) 2006 Apple Computer, Inc. All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice,
 *  this list of conditions and the following disclaimer.
 *
 *  2. Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder(s) nor the names of any
 *  contributors may be used to endorse or promote products derived from
 *  this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 *  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function(){
  function CubicBezierAtTime(t,p1x,p1y,p2x,p2y,duration) {
    var ax=0,bx=0,cx=0,ay=0,by=0,cy=0;
    function sampleCurveX(t) {return ((ax*t+bx)*t+cx)*t;};
    function sampleCurveY(t) {return ((ay*t+by)*t+cy)*t;};
    function sampleCurveDerivativeX(t) {return (3.0*ax*t+2.0*bx)*t+cx;};
    function solveEpsilon(duration) {return 1.0/(200.0*duration);};
    function solve(x,epsilon) {return sampleCurveY(solveCurveX(x,epsilon));};
    function fabs(n) {if(n>=0) {return n;}else {return 0-n;}};
    function solveCurveX(x,epsilon) {
      var t0,t1,t2,x2,d2,i;
      for(t2=x, i=0; i<8; i++) {x2=sampleCurveX(t2)-x; if(fabs(x2)<epsilon) {return t2;} d2=sampleCurveDerivativeX(t2); if(fabs(d2)<1e-6) {break;} t2=t2-x2/d2;}
      t0=0.0; t1=1.0; t2=x; if(t2<t0) {return t0;} if(t2>t1) {return t1;}
      while(t0<t1) {x2=sampleCurveX(t2); if(fabs(x2-x)<epsilon) {return t2;} if(x>x2) {t0=t2;}else {t1=t2;} t2=(t1-t0)*.5+t0;}
      return t2; // Failure.
    };
    cx=3.0*p1x; bx=3.0*(p2x-p1x)-cx; ax=1.0-cx-bx; cy=3.0*p1y; by=3.0*(p2y-p1y)-cy; ay=1.0-cy-by;
    return solve(t, solveEpsilon(duration));
  }
  S2.FX.cubicBezierTransition = function(x1, y1, x2, y2){
    return (function(pos){
      return CubicBezierAtTime(pos,x1,y1,x2,y2,1);
    });
  }
})();

S2.FX.Transitions.webkitCubic =
  S2.FX.cubicBezierTransition(0.25,0.1,0.25,1);
S2.FX.Transitions.webkitEaseInOut =
  S2.FX.cubicBezierTransition(0.42,0.0,0.58,1.0);

/*!
 *  TERMS OF USE - EASING EQUATIONS
 *  Open source under the BSD License.
 *  Easing Equations (c) 2003 Robert Penner, all rights reserved.
 */

Object.extend(S2.FX.Transitions, {
  easeInQuad: function(pos){
     return Math.pow(pos, 2);
  },

  easeOutQuad: function(pos){
    return -(Math.pow((pos-1), 2) -1);
  },

  easeInOutQuad: function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
    return -0.5 * ((pos-=2)*pos - 2);
  },

  easeInCubic: function(pos){
    return Math.pow(pos, 3);
  },

  easeOutCubic: function(pos){
    return (Math.pow((pos-1), 3) +1);
  },

  easeInOutCubic: function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
    return 0.5 * (Math.pow((pos-2),3) + 2);
  },

  easeInQuart: function(pos){
    return Math.pow(pos, 4);
  },

  easeOutQuart: function(pos){
    return -(Math.pow((pos-1), 4) -1)
  },

  easeInOutQuart: function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
    return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
  },

  easeInQuint: function(pos){
    return Math.pow(pos, 5);
  },

  easeOutQuint: function(pos){
    return (Math.pow((pos-1), 5) +1);
  },

  easeInOutQuint: function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5);
    return 0.5 * (Math.pow((pos-2),5) + 2);
  },

  easeInSine: function(pos){
    return -Math.cos(pos * (Math.PI/2)) + 1;
  },

  easeOutSine: function(pos){
    return Math.sin(pos * (Math.PI/2));
  },

  easeInOutSine: function(pos){
    return (-.5 * (Math.cos(Math.PI*pos) -1));
  },

  easeInExpo: function(pos){
    return (pos==0) ? 0 : Math.pow(2, 10 * (pos - 1));
  },

  easeOutExpo: function(pos){
    return (pos==1) ? 1 : -Math.pow(2, -10 * pos) + 1;
  },

  easeInOutExpo: function(pos){
    if(pos==0) return 0;
    if(pos==1) return 1;
    if((pos/=0.5) < 1) return 0.5 * Math.pow(2,10 * (pos-1));
    return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
  },

  easeInCirc: function(pos){
    return -(Math.sqrt(1 - (pos*pos)) - 1);
  },

  easeOutCirc: function(pos){
    return Math.sqrt(1 - Math.pow((pos-1), 2))
  },

  easeInOutCirc: function(pos){
    if((pos/=0.5) < 1) return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
    return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
  },

  easeOutBounce: function(pos){
    if ((pos) < (1/2.75)) {
      return (7.5625*pos*pos);
    } else if (pos < (2/2.75)) {
      return (7.5625*(pos-=(1.5/2.75))*pos + .75);
    } else if (pos < (2.5/2.75)) {
      return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
    } else {
      return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
    }
  },

  easeInBack: function(pos){
    var s = 1.70158;
    return (pos)*pos*((s+1)*pos - s);
  },

  easeOutBack: function(pos){
    var s = 1.70158;
    return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
  },

  easeInOutBack: function(pos){
    var s = 1.70158;
    if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
    return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
  },

  elastic: function(pos) {
    return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
  },

  swingFromTo: function(pos) {
    var s = 1.70158;
    return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
      0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
  },

  swingFrom: function(pos) {
    var s = 1.70158;
    return pos*pos*((s+1)*pos - s);
  },

  swingTo: function(pos) {
    var s = 1.70158;
    return (pos-=1)*pos*((s+1)*pos + s) + 1;
  },

  bounce: function(pos) {
    if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
    } else if (pos < (2/2.75)) {
        return (7.5625*(pos-=(1.5/2.75))*pos + .75);
    } else if (pos < (2.5/2.75)) {
        return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
    } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
    }
  },

  bouncePast: function(pos) {
    if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
    } else if (pos < (2/2.75)) {
        return 2 - (7.5625*(pos-=(1.5/2.75))*pos + .75);
    } else if (pos < (2.5/2.75)) {
        return 2 - (7.5625*(pos-=(2.25/2.75))*pos + .9375);
    } else {
        return 2 - (7.5625*(pos-=(2.625/2.75))*pos + .984375);
    }
  },

  easeFromTo: function(pos) {
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
    return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
  },

  easeFrom: function(pos) {
    return Math.pow(pos,4);
  },

  easeTo: function(pos) {
    return Math.pow(pos,0.25);
  }
});
(function(FX) {

  Hash.addMethods({
    hasKey: function(key) {
      return (key in this._object);
    }
  });

  try {
    document.createEvent("WebKitTransitionEvent");
  } catch(e) {
    return;
  }


  Prototype.BrowserFeatures.WebkitCSSTransitions = true;
  S2.Extensions.webkitCSSTransitions = true;

  CSS_TRANSITIONS_PROPERTIES = $w(
   'webkitBorderTopLeftRadius webkitBorderTopRightRadius ' +
   'webkitBorderBottomLeftRadius webkitBorderBottomRightRadius ' +
   'webkitBackgroundSize'
  );

  CSS_TRANSITIONS_HARDWARE_ACCELERATED_PROPERTIES =
   $w('top left bottom right opacity');

  var TRANSLATE_TEMPLATE = new Template("translate(#{0}px, #{1}px)");


  var Operators = FX.Operators;

  Operators.WebkitCssTransition = Class.create(Operators.Base, {
    initialize: function($super, effect, object, options) {
      $super(effect, object, options);
      this.element = $(this.object);

      if (!Object.isString(this.options.style)) {
        this.style = $H(this.options.style);
      } else {
        if (this.options.style.include(':')) {
          this.style = $H(S2.CSS.parseStyle(this.options.style));
        } else {
          this.element.addClassName(options.style);
          var after = this.element.getStyles();
          this.element.removeClassName(options.style);
          var before = this.element.getStyles();
          this.style = $H(after).reject( function(style) {
            return style.value === css[style.key];
          });
        }
      }

      var targetStyle = '';
      this.style.each( function(pair) {
        var property = pair.key.underscore().dasherize();
        if (property.startsWith('webkit')) property = '-' + property;
        targetStyle += ';' + property + ':' + pair.value;
      });

      this.targetStyle = targetStyle;
    },

    _canHardwareAccelerate: function() {
      var style = this.style.toObject(), keys = this.style.keys();
      var element = this.element;

      var otherPropertyExists = keys.any( function(key) {
        return !CSS_TRANSITIONS_HARDWARE_ACCELERATED_PROPERTIES.include(key);
      });

      if (otherPropertyExists) return false;

      var currentStyles = {
        left:   element.getStyle('left'),
        right:  element.getStyle('right'),
        top:    element.getStyle('top'),
        bottom: element.getStyle('bottom')
      };

      function hasTwoPropertiesOnSameAxis(obj) {
        if (obj.top && obj.bottom) return true;
        if (obj.left && obj.right) return true;
        return false;
      }

      if (hasTwoPropertiesOnSameAxis(currentStyles)) return false;
      if (hasTwoPropertiesOnSameAxis(style))         return false;

      return true;
    },

    _adjustForHardwareAcceleration: function(style) {
      var dx = 0, dy = 0;
      $w('top bottom left right').each( function(prop) {
        if (!style.hasKey(prop)) return;
        var current = window.parseInt(this.element.getStyle(prop), 10);
        var target  = window.parseInt(style.get(prop), 10);

        if (prop === 'top') {
          dy += (target - current);
        } else if (prop === 'bottom') {
          dy += (current - target);
        } else if (prop === 'left') {
          dx += (target - current);
        } else if (prop === 'right') {
          dx += (current - target);
        }
        style.unset(prop);
      }, this);

      if (dx !== 0 || dy !== 0) {
        var translation = TRANSLATE_TEMPLATE.evaluate([dx, dy]);
        style.set('webkitTransform', translation);
      }

      this.targetStyle += ';-webkit-transform: translate(0px, 0px);';
      return style;
    },

    render: function() {
      var style = this.style.clone(), effect = this.effect;
      if (this._canHardwareAccelerate()) {
        style = this._adjustForHardwareAcceleration(style);
      }

      var s = this.element.style;

      s.webkitTransitionProperty = style.keys().join(',');
      s.webkitTransitionDuration = (effect.duration / 1000).toFixed(3) + 's';
      s.webkitTransitionTimingFunction =
       timingFunctionForTransition(effect.options.transition);

      style.each( function(pair) {
        var property = pair.key.camelize();
        s[property] = pair.value;
      });

      this.element.store('s2.targetStyle', this.targetStyle);

      this.render = Prototype.emptyFunction;
    }
  });

  function timingFunctionForTransition(transition) {
    var timing = null, MAP = S2.FX.Operators.WebkitCssTransition.TIMING_MAP;

    for (var t in MAP) {
      if (S2.FX.Transitions[t] === transition) {
        timing = MAP[t];
        break;
      }
    }
    return timing;
  }


  function isWebkitCSSTransitionCompatible(effect){
    if (!S2.Extensions.webkitCSSTransitions) return false;
    var opt = effect.options;

    if ((opt.engine || '') === 'javascript') return false;

    if (!timingFunctionForTransition(opt.transition)) return false;

    if (opt.propertyTransitions) return false;

    return true;
  };

  S2.FX.Morph = Class.create(S2.FX.Morph, {
    setup: function() {
      if (this.options.change) {
        this.setupWrappers();
      } else if (this.options.style) {
        this.engine  = 'javascript';
        var operator = 'style';
        if (isWebkitCSSTransitionCompatible(this)) {
          this.engine = 'webkit';
          operator    = 'webkitCssTransition';
        }

        this.animate(operator, this.destinationElement || this.element, {
          style: this.options.style,
          propertyTransitions: this.options.propertyTransitions || { }
        });
      }
    },

    render: function($super, position) {
      if (this.engine === 'webkit') {
        this.element.store('s2.effect', this);

        if (this.options.before) {
          this.element.store('s2.beforeStartEffect', this.options.before);
        }

        if (this.options.after) {
          this.element.store('s2.afterFinishEffect', this.options.after);
          delete this.options.after;
        }

        this.render = Prototype.emptyFunction;
      }
      return $super(position);
    }
  });

  S2.FX.webkitTransitionStartEvent =
  document.observe('webkitTransitionStart', function(event) {
    var element = event.element();
    if (!element) return;

    var before = element.retrieve('s2.beforeStartEffect');
    element.store('s2.beforeStartEffect', null);

    if (before) before();
  });

  S2.FX.webkitTransitionEndEvent =
  document.observe('webkitTransitionEnd', function(event) {
    var element = event.element();
    if (!element) return;

    function adjust() {
      var targetStyle = element.retrieve('s2.targetStyle');
      if (!targetStyle) return;
      element.setStyle(targetStyle);
    }

    (function (){
      element.style.webkitTransitionDuration = '';

      adjust.defer();
    }).defer();

    var after = element.retrieve('s2.afterStartEffect');
    element.store('s2.afterStartEffect', null);
    if (after) after();
  });

  S2.FX.Operators.WebkitCssTransition.TIMING_MAP = {
    linear:     'linear',
    sinusoidal: 'ease-in-out'
  };
})(S2.FX);

Element.__scrollTo = Element.scrollTo;
Element.addMethods({
  scrollTo: function(element, to, options){
    if(arguments.length == 1) return Element.__scrollTo(element);
    new S2.FX.Scroll(element, Object.extend(options || {}, { to: to })).play();
    return element;
  }
});

Element.addMethods({
  effect: function(element, effect, options){
    if (Object.isFunction(effect))
      effect = new effect(element, options);
    else if (Object.isString(effect))
      effect = new S2.FX[effect.capitalize()](element, options);
    effect.play(element, options);
    return element;
  },

  morph: function(element, style, options){
    options = S2.FX.parseOptions(options);
    if(!options.queue){
      options.queue = element.retrieve('S2.FX.Queue');
      if(!options.queue)
        element.store('S2.FX.Queue', options.queue = new S2.FX.Queue());
    }
    if(!options.position) options.position = 'end';
    return element.effect('morph', Object.extend(options, {style: style}));
  }.optionize(),

  appear: function(element, options){
    return element.effect('morph', Object.extend({
      before: function(){ element.show().setStyle({opacity: 0}); },
      style:  'opacity:1'
    }, options));
  },

  fade: function(element, options){
    return element.effect('morph', Object.extend({
      style: 'opacity:0',
      after: element.hide.bind(element)
    }, options));
  },

  cloneWithoutIDs: function(element) {
    element = $(element);
    var clone = element.cloneNode(true);
    clone.id = '';
    $(clone).select('*[id]').each(function(e) { e.id = ''; });
    return clone;
  }
});

(function(){
  var transform;

  if(window.CSSMatrix) transform = function(element, transform){
    element.style.transform = 'scale('+(transform.scale||1)+') rotate('+(transform.rotation||0)+'rad)';
    return element;
  };
  else if(window.WebKitCSSMatrix) transform = function(element, transform){
    element.style.webkitTransform = 'scale('+(transform.scale||1)+') rotate('+(transform.rotation||0)+'rad)';
    return element;
  };
  else if(Prototype.Browser.Gecko) transform = function(element, transform){
    element.style.MozTransform = 'scale('+(transform.scale||1)+') rotate('+(transform.rotation||0)+'rad)';
    return element;
  };
  else if(Prototype.Browser.IE) transform = function(element, transform){
    if(!element._oDims)
      element._oDims = [element.offsetWidth, element.offsetHeight];
    var c = Math.cos(transform.rotation||0) * 1, s = Math.sin(transform.rotation||0) * 1,
        filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+c+",M12="+(-s)+",M21="+s+",M22="+c+")";
    element.style.filter = filter;
    element.style.marginLeft = (element._oDims[0]-element.offsetWidth)/2+'px';
    element.style.marginTop = (element._oDims[1]-element.offsetHeight)/2+'px';
    return element;
  };
  else transform = function(element){ return element; }

  Element.addMethods({ transform: transform });
})();

S2.viewportOverlay = function(){
  var viewport = document.viewport.getDimensions(),
    offsets = document.viewport.getScrollOffsets();
  return new Element('div').setStyle({
    position: 'absolute',
    left: offsets.left + 'px', top: offsets.top + 'px',
    width: viewport.width + 'px', height: viewport.height + 'px'
  });
};
S2.FX.Helpers = {
  fitIntoRectangle: function(w, h, rw, rh){
    var f = w/h, rf = rw/rh; return f < rf ?
      [(rw - (w*(rh/h)))/2, 0, w*(rh/h), rh] :
      [0, (rh - (h*(rw/w)))/2, rw, h*(rw/w)];
  }
};

S2.FX.Operators.Zoom = Class.create(S2.FX.Operators.Style, {
  initialize: function($super, effect, object, options) {
    var viewport = document.viewport.getDimensions(),
      offsets = document.viewport.getScrollOffsets(),
      dims = object.getDimensions(),
      f = S2.FX.Helpers.fitIntoRectangle(dims.width, dims.height,
      viewport.width - (options.borderWidth || 0)*2,
      viewport.height - (options.borderWidth || 0)*2);

    Object.extend(options, { style: {
      left: f[0] + (options.borderWidth || 0) + offsets.left + 'px',
      top: f[1] + (options.borderWidth || 0) + offsets.top + 'px',
      width: f[2] + 'px', height: f[3] + 'px'
    }});
    $super(effect, object, options);
  }
});

S2.FX.Zoom = Class.create(S2.FX.Element, {
  setup: function() {
    this.clone = this.element.cloneWithoutIDs();
    this.element.insert({before:this.clone});
    this.clone.absolutize().setStyle({zIndex:9999});

    this.overlay = S2.viewportOverlay();
    if (this.options.overlayClassName)
      this.overlay.addClassName(this.options.overlayClassName)
    else
      this.overlay.setStyle({backgroundColor: '#000', opacity: '0.9'});
    $$('body')[0].insert(this.overlay);

    this.animate('zoom', this.clone, {
      borderWidth: this.options.borderWidth,
      propertyTransitions: this.options.propertyTransitions || { }
    });
  },
  teardown: function() {
    this.clone.observe('click', function() {
      this.overlay.remove();
      this.clone.morph('opacity:0', {
        duration: 0.2,
        after: function() {
          this.clone.remove();
        }.bind(this)
      })
    }.bind(this));
  }
});



S2.UI = {};


S2.UI.Mixin = {};


Object.deepExtend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

S2.UI.Mixin.Configurable = {
  setOptions: function(options) {
    if (!this.options) {
      this.options = {};
      var constructor = this.constructor;
      if (constructor.superclass) {
        var chain = [], klass = constructor;
        while (klass = klass.superclass)
          chain.push(klass);
        chain = chain.reverse();

        for (var i = 0, l = chain.length; i < l; i++)
          Object.deepExtend(this.options, chain[i].DEFAULT_OPTIONS || {});
      }

      Object.deepExtend(this.options, constructor.DEFAULT_OPTIONS || {});
    }
    return Object.deepExtend(this.options, options || {});
  }
};

S2.UI.Mixin.Trackable = {
  register: function() {
    var klass = this.constructor;
    if (!klass.instances) {
      klass.instances = [];
    }
    if (!klass.instances.include(this)) {
      klass.instances.push(this);
    }

    if (Object.isFunction(klass.onRegister)) {
      klass.onRegister.call(klass, this);
    }
  },

  unregister: function() {
    var klass = this.constructor;
    klass.instances = klass.instances.without(this);
    if (Object.isFunction(klass.onRegister)) {
      klass.onUnregister.call(klass, this);
    }
  }
};

(function() {
  var METHODS = $w('observe stopObserving show hide ' +
   'addClassName removeClassName hasClassName setStyle getStyle' +
   'writeAttribute readAttribute on fire');

  var E = {};

  METHODS.each( function(name) {
    E[name] = function() {
      var element = this.toElement();
      return element[name].apply(element, arguments);
    };
  });

  window.S2.UI.Mixin.Element = E;
})();


S2.UI.Mixin.Shim = {
  __SHIM_TEMPLATE: new Template(
    "<iframe frameborder='0' tabindex='-1' src='javascript:false;' " +
      "style='display:block;position:absolute;z-index:-1;overflow:hidden; " +
      "filter:Alpha(Opacity=\"0\");" +
      "top:expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\');" +
       "left:expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\');" +
       "width:expression(this.parentNode.offsetWidth+\'px\');" +
       "height:expression(this.parentNode.offsetHeight+\'px\');" +
    "' id='#{0}'></iframe>"
  ),

  createShim: function(element) {
    this.__shim_isie6 = (Prototype.Browser.IE &&
     (/6.0/).test(navigator.userAgent));
    if (!this.__shim_isie6) return;

    element = $(element || this.element);
    if (!element) return;

    this.__shimmed = element;

    var id = element.identify() + '_iframeshim', shim = $(id);

    if (shim) shim.remove();

    element.insert({
      top: this.__SHIM_TEMPLATE.evaluate([id])
    });

    this.__shim_id = id;
  },

  adjustShim: function() {
    if (!this.__shim_isie6) return;
    var shim = this.__shimmed.down('iframe#' + this.__shim_id);
    var element = this.__shimmed;
    if (!shim) return;

    shim.setStyle({
      width:  element.offsetWidth  + 'px',
      height: element.offsetHeight + 'px'
    });
  },

  destroyShim: function() {
    if (!this.__shim_isie6) return;
    var shim = this.__shimmed.down('iframe#' + this.__shim_id);
    if (shim) {
      shim.remove();
    }

    this.__shimmed = null;
  }
};

Object.extend(S2.UI, {
  addClassNames: function(elements, classNames) {
    if (Object.isElement(elements)) {
      elements = [elements];
    }

    if (Object.isString(classNames)) {
      classNames = classNames.split(' ');
    }

    var j, className;
    for (var i = 0, element; element = elements[i]; i++) {
      for (j = 0; className = classNames[j]; j++) {
        Element.addClassName(element, className);
      }
    }

    return elements;
  },

  removeClassNames: function(elements, classNames) {
    if (Object.isElement(elements)) {
      elements = [elements];
    }

    if (Object.isString(classNames)) {
      classNames = classNames.split(' ');
    }

    var j, className;
    for (var i = 0, element; element = elements[i]; i++) {
      for (j = 0; className = classNames[j]; j++) {
        Element.removeClassName(element, className);
      }
    }
  },

  FOCUSABLE_ELEMENTS: $w('input select textarea button object'),

  isFocusable: function(element) {
    var name = element.nodeName.toLowerCase(),
     tabIndex = element.readAttribute('tabIndex'),
     isFocusable = false;

    if (S2.UI.FOCUSABLE_ELEMENTS.include(name)) {
      isFocusable = !element.disabled;
    } else if (name === 'a' || name === 'area') {
      isFocusable = element.href || (tabIndex && !isNaN(tabIndex));
    } else {
      isFocusable = tabIndex && !isNaN(tabIndex);
    }
    return !!isFocusable && S2.UI.isVisible(element);
  },


  makeFocusable: function(elements, shouldBeFocusable) {
    if (Object.isElement(elements)) {
      elements = [elements];
    }

    var value = shouldBeFocusable ? '0' : '-1';
    for (var i = 0, element; element = elements[i]; i++) {
      $(element).writeAttribute('tabIndex', value);
    }
  },

  findFocusables: function(element) {
    return $(element).descendants().select(S2.UI.isFocusable);
  },

  isVisible: function(element) {
    element = $(element);
    var originalElement = element;

    while (element && element.parentNode) {
      var display = element.getStyle('display'),
       visibility = element.getStyle('visibility');

      if (display === 'none' || visibility === 'hidden') {
        return false;
      }
      element = $(element.parentNode);
    }
    return true;
  },

  makeVisible: function(elements, shouldBeVisible) {
    if (Object.isElement(elements)) {
      elements = [elements];
    }

    var newValue = shouldBeVisible ? "visible": "hidden";
    for (var i = 0, element; element = elements[i]; i++) {
      element.setStyle({ 'visibility': newValue });
    }

    return elements;
  },

  modifierUsed: function(event) {
    return event.metaKey || event.ctrlKey || event.altKey;
  },

  getText: function(element) {
    element = $(element);
    return element.innerText && !window.opera ? element.innerText :
     element.innerHTML.stripScripts().unescapeHTML().replace(/[\n\r\s]+/g, ' ');
  }
});

(function() {
  var IGNORED_ELEMENTS = [];
  function _textSelectionHandler(event) {
    var element = Event.element(event);
    if (!element) return;
    for (var i = 0, node; node = IGNORED_ELEMENTS[i]; i++) {
      if (element === node || element.descendantOf(node)) {
        Event.stop(event);
        break;
      }
    }
  }

  if (document.attachEvent) {
    document.onselectstart = _textSelectionHandler.bindAsEventListener(window);
  } else {
    document.observe('mousedown', _textSelectionHandler);
  }

  Object.extend(S2.UI, {
    enableTextSelection: function(element) {
      element.setStyle({
        '-moz-user-select': '',
        '-webkit-user-select': '',
        'user-select': ''
      });
      IGNORED_ELEMENTS = IGNORED_ELEMENTS.without(element);
      return element;
    },

    disableTextSelection: function(element) {
      element.setStyle({
        '-moz-user-select': 'none',
        '-webkit-user-select': 'none',
        'user-select': ''
      });
      if (!IGNORED_ELEMENTS.include(element)) {
        IGNORED_ELEMENTS.push(element);
      }
      return element;
    }
  });
})();
S2.UI.Behavior = Class.create(S2.UI.Mixin.Configurable, {
  initialize: function(element, options) {
    this.element = element;
    this.setOptions(options);

    Object.extend(this, options);

    this._observers = {};

    function isEventHandler(eventName) {
      return eventName.startsWith('on') || eventName.include('/on');
    }

    var parts, element, name, handler;
    for (var eventName in this) {
      if (!isEventHandler(eventName)) continue;

      parts = eventName.split('/');
      if (parts.length === 2) {
        element = this[parts.first()] || this.element;
      } else {
        element = this.element;
      }
      name = parts.last();

      handler = this._observers[name] = this[eventName].bind(this);
      element.observe(name.substring(2), handler);
    }
  },

  destroy: function() {
    var element = this.options.proxy || this.element;
    var handler;
    for (var eventName in this._observers) {
      handler = this._observers[eventName];
      element.stopObserving(eventName.substring(2), handler);
    }
  }
});


Object.extend(S2.UI, {
  addBehavior: function(element, behaviorClass, options) {
    var self = arguments.callee;
    if (Object.isArray(element)) {
      element.each( function(el) { self(el, behaviorClass, options); });
      return;
    }

    if (Object.isArray(behaviorClass)) {
      behaviorClass.each( function(klass) { self(element, klass, options ); });
      return;
    }

    var instance = new behaviorClass(element, options || {});
    var behaviors = $(element).retrieve('ui.behaviors', []);
    behaviors.push(instance);
  },

  removeBehavior: function(element, behaviorClass) {
    var self = arguments.callee;
    if (Object.isArray(element)) {
      element.each( function(el) { self(el, behaviorClass); });
      return;
    }

    if (Object.isArray(behaviorClass)) {
      behaviorClass.each( function(klass) { self(element, klass); });
      return;
    }

    var behaviors = $(element).retrieve('ui.behaviors', []);
    var shouldBeRemoved = [];
    for (var i = 0, behavior; behavior = behaviors[i]; i++) {
      if (!behavior instanceof behaviorClass) continue;
      behavior.destroy();
      shouldBeRemoved.push(behavior);
    }
    $(element).store('ui.behaviors', behaviors.without(shouldBeRemoved));
  },


  getBehavior: function(element, behaviorClass) {
    element = $(element);

    var behaviors = element.retrieve('ui.behaviors', []);
    for (var i = 0, l = behaviors.length, b; i < l; i++) {
      b = behaviors[i];
      if (b.constructor === behaviorClass) return b;
    }

    return null;
  }
});

S2.UI.Behavior.Drag = Class.create(S2.UI.Behavior, {
  initialize: function($super, element, options) {
    this.__onmousemove = this._onmousemove.bind(this);
    $super(element, options);
    this.element.addClassName('ui-draggable');
  },

  destroy: function($super) {
    this.element.removeClassName('ui-draggable');
    $super();
  },

  "handle/onmousedown": function(event) {
    var element = this.element;
    this._startPointer  = event.pointer();
    this._startPosition = {
      left: window.parseInt(element.getStyle('left'), 10),
      top:  window.parseInt(element.getStyle('top'),  10)
    };
    document.observe('mousemove', this.__onmousemove);
  },

  "handle/onmouseup": function(event) {
    this._startPointer  = null;
    this._startPosition = null;
    document.stopObserving('mousemove', this.__onmousemove);
  },

  _onmousemove: function(event) {
    var pointer = event.pointer();

    if (!this._startPointer) return;

    var delta = {
      x: pointer.x - this._startPointer.x,
      y: pointer.y - this._startPointer.y
    };

    var newPosition = {
      left: (this._startPosition.left + delta.x) + 'px',
      top:  (this._startPosition.top  + delta.y) + 'px'
    };

    this.element.setStyle(newPosition);
  }
});
S2.UI.Behavior.Focus = Class.create(S2.UI.Behavior, {
  onfocus: function(event) {
    if (this.element.hasClassName('ui-state-disabled')) return;
    this.element.addClassName('ui-state-focus');
  },

  onblur: function(event) {
    if (this.element.hasClassName('ui-state-disabled')) return;
    this.element.removeClassName('ui-state-focus');
  }
});
S2.UI.Behavior.Hover = Class.create(S2.UI.Behavior, {
  onmouseenter: function(event) {
    if (this.element.hasClassName('ui-state-disabled')) return;
    this.element.addClassName('ui-state-hover');
  },

  onmouseleave: function(event) {
    if (this.element.hasClassName('ui-state-disabled')) return;
    this.element.removeClassName('ui-state-hover');
  }
});
S2.UI.Behavior.Resize = Class.create(S2.UI.Behavior, {
  initialize: function(element, options) {
  }
});
S2.UI.Behavior.Down = Class.create(S2.UI.Behavior, {
  _isRelevantKey: function(event) {
    var code = event.keyCode;
    return (code === Event.KEY_RETURN || code === Event.KEY_SPACE);
  },

  onkeydown: function(event) {
    if (!this._isRelevantKey(event)) return;
    this.onmousedown(event);
  },

  onkeyup: function(event) {
    if (!this._isRelevantKey(event)) return;
    this.onmouseup(event);
  },

  onmousedown: function(event) {
    this._down = true;
    if (this.element.hasClassName('ui-state-disabled')) return;
    this.element.addClassName('ui-state-down');
  },

  onmouseup: function(event) {
    this._down = false;
    if (this.element.hasClassName('ui-state-disabled')) return;
    this.element.removeClassName('ui-state-down');
  },

  onmouseleave: function(event) {
    return this.onmouseup(event);
  },

  onmouseenter: function(event) {
    if (this._down) {
      return this.onmousedown(event);
    }
  }
});

(function(UI) {

  UI.Base = Class.create(UI.Mixin.Configurable, {
    NAME: "S2.UI.Base",

    addObservers:    Function.ABSTRACT,

    removeObservers: Function.ABSTRACT,

    destroy: function() {
      this.removeObservers();
    },

    toElement: function() {
      return this.element;
    },

    inspect: function() {
      return "#<#{NAME}>".interpolate(this);
    }
  });

})(S2.UI);

Object.extend(Event, {
  KEY_SPACE: 32
});