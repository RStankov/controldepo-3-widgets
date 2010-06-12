S2.FX.Fade = Class.create(S2.FX.Element, {
	setup: function() {
		this.animate('style', this.element, {style: 'opacity:0'});
	},
	teardown: function() {
		this.element.hide();
	}
});

S2.FX.Appear = Class.create(S2.FX.Element, {
	setup: function() {
		this.animate('style', this.element.setOpacity(0).show(), {style: 'opacity:1'});
	}
});

S2.FX.Highlight = Class.create(S2.FX.Element, {
  initialize: function($super, element, options){
    $super(element, Object.extend({
      startColor: 			  '#ffff99',
      endColor:				      false,
      restoreColor:			    true,
      keepBackgroundImage:	false
    }, options));
  },
  setup: function(){
    if (this.element.getStyle('display') == 'none'){
      return this.cancel();
    }

    if (!this.options.endColor){
      this.options.endColor = this.element.getStyle('background-color');
    }
    
    if (this.options.restoreColor){
      this.options.restoreColor	= this.element.style.backgroundColor;
    }
    
    if (this.options.keepBackgroundImage){
      this.restoreBackgroundImage = this.element.getStyle('background-image');
      this.element.style.backgroundImage = 'none';
    }

    this.element.style.backgroundColor = this.options.startColor;
    this.animate("style", this.element, { style: "background-color: " + this.options.endColor});
  },
  teardown: function(){
    this.element.style.backgroundColor = this.options.restoreColor;
    if (this.options.keepBackgroundImage){
      this.element.style.backgroundImage = this.restoreBackgroundImage;
    }
  }
});

Element.addMethods(['slideDown', 'slideUp', 'highlight', 'appear', 'fade'].inject({}, function(methods, effect){
  var name = effect.charAt(0).toUpperCase() + effect.substring(1);
  methods[effect] = function(element, options){
    element = $(element);
    new S2.FX[name](element, options).play();
    return element;
  };
  return methods;
}));

Element.addMethods({
	toggleWithEffect: (function(){
		var PAIRS = {
			'fade':  ['Fade', 'Appear'],
			'slide': ['SlideUp', 'SlideDown']
		};
		return function(element, effect, options){
			element = $(element);
			
			new S2.FX[(PAIRS[effect] || PAIRS['fade'])[element.visible() ? 0 : 1]](element, options).play();
			return element;
		}
	})()
});