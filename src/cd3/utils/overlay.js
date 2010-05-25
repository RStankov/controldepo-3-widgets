CD3.Util.Overlay = Class.create(S2.UI.Mixin.Shim, {
  initialize: function(element, opacity){
    this.element  = $(element) || new Element('div');
    this.visible  = Element.visible.curry(this.element);
    this.appear   = new S2.FX.Appear(this.element, {to: opacity || 0.7});
    this.onResize = new Event.Handler(window, 'resize', null, this.positionate.bind(this));
    this.element.hide();
    this.createShim();
  },
  show: function(){
    this.onResize.start();
    this.positionate();
    this.appear.play();
  },
  hide: function(){
    this.onResize.stop();
    this.element.hide();
  },
  positionate: function(){
    var width, height;
    if (window.innerHeight && window.scrollMaxY) {	
      width  = window.innerWidth + window.scrollMaxX;
      height = window.innerHeight + window.scrollMaxY;
    } else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
      width  = document.body.scrollWidth;
      height = document.body.scrollHeight;
    } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
      width  = document.body.offsetWidth;
      height = document.body.offsetHeight;
    }
    this.element.setStyle({
      top:    '0px',
      left:   '0px',
      width:  width + 'px',
      height: height + 'px'
    });
    
    this.adjustShim();
  },
  toElement: function(){
    return this.element;
  }
});