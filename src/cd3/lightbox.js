CD3.Lightbox = CD3.Widget.create('CD3.Lightbox', {
  overlay:    0.7,
  fxDuration: 0.5,
  startSize:  250,
  label:      "Image #{index} of #{count}"
}, (function(){
  function buildUI(){
    $$('body')[0].insert([
      this.overlay = new CD3.Util.Overlay(new Element('div', {id: 'overlay'}), this.options.overlay),
      this.element = new Element('div', {id: 'lightbox'}).hide().update([
        '<div class="image_container">',
          '<img />',
          '<ul>',
            '<li class="previous"></li>',
            '<li class="next"></li>',
          '</ul>',
        '</div>',
        '<div class="navigation">',
          '<h3></h3>',
          '<p></p>',
          '<span class="close"></span>',
        '</div>'
      ].join(''))
    ]);
    
    this.imageContainer   = this.element.down('.image_container');
    this.navigation       = this.element.down('.navigation');
    this.image            = this.imageContainer.down('img');
    this.nextButton       = this.imageContainer.down('.next');
    this.prevButton       = this.imageContainer.down('.previous');
    this.closeButton      = this.element.down('.close');
    this.caption          = this.navigation.down('h3');
    this.numberDisplay    = this.navigation.down('p');
  }
  
  function getImageNumber(imageLink){
    if (imageLink.rel == 'lightbox'){
      this.images = [[imageLink.href, imageLink.title]];
      return 0;
    }
    
    this.images = $$(imageLink.tagName + '[href][rel="' + imageLink.rel + '"]').map(function(anchor){
      return [anchor.href, anchor.title];
    }).uniq();
      
    var i = 0;
    while (this.images[i][0] != imageLink.href) { i++; }
    return i;
  }
  
  function topLeftStyle(width, height){
    var dim     = document.viewport.getDimensions(), 
        scroll  = document.viewport.getScrollOffsets(),
        top	  	= Math.max(0, parseInt(scroll.top  + (dim.height - height ) / 2)),
        left	  = Math.max(0, parseInt(scroll.left + (dim.width  - width  )  / 2));

    return {
      top:    top  + 'px',
      left:   left + 'px'
    };
  }
  
  function showImage(imageNum){
    if (!this.images[imageNum]) return;
    
    this.keyboard.stop();
    
    this.activeImage = imageNum;
    
    this.image.hide();
    this.navigation.hide();
    this.element.addClassName('loading');
    this.loadImage(this.images[this.activeImage][0]);
  }
  
  function afterImageLoaded(image){
    this.image.src    = image.src;
    this.image.width  = image.width;
    this.image.height = image.height;
    
    this.fx.position.play(null, {style: topLeftStyle(image.width, image.height)});
    this.fx.resize.play(null,   {style: {width: image.width + 'px', height: image.height + 'px'}});
  }
  
  function afterResize(){
    this.prevButton.setStyle({ 
      height:     this.image.height + 'px',
      visibility: this.activeImage > 0 ? 'visible' : 'hidden'
    });
    this.nextButton.setStyle({
      height:     this.image.height + 'px',
      visibility: this.activeImage < this.images.length - 1 ? 'visible' : 'hidden'
    });
    
    this.element.removeClassName('loading');
    
    this.fx.appear.play();
    this.fx.navigation.play();
    
    if (this.images.length > this.activeImage + 1)  CD3.Util.preloadImage(this.images[this.activeImage + 1][0]);
    if (this.activeImage > 0)                       CD3.Util.preloadImage(this.images[this.activeImage - 1][0]);
  }
  
  function updateNavigation(){
    this.keyboard.start();
  
    if (this.images[this.activeImage][1]){
      this.caption.update(this.images[this.activeImage][1]).show();
    } else {
      this.caption.hide();
    }

    if (this.images.length > 1){
      this.numberDisplay.update(this.options.label.interpolate({index: this.activeImage + 1, count: this.images.length}));
      this.numberDisplay.show();
    } else {
      this.numberDisplay.hide();
    }
  }
  
  function onKeyDown(e){
    switch(e.keyCode){
      case Event.KEY_ESC:   return this.close();
      case Event.KEY_LEFT:  return this.previous();
      case Event.KEY_RIGHT: return this.next();
    }
  }

  return {
    setup: function(){
      buildUI.call(this);
  
      this.images       = [];
      this.activeImage  = null;
      this.loadImage    = CD3.Util.createImageLoader(afterImageLoaded.bind(this));
      
      var duration = this.options.fxDuration;
      this.fx = {
        position:   new S2.FX.Style(this.element, duration),
        resize:     new S2.FX.Style(this.imageContainer, { duration: duration, after: afterResize.bind(this)}),
        appear:     new S2.FX.Appear(this.image, duration),
        navigation: new S2.FX.SlideDown(this.navigation, {duration: duration, after: updateNavigation.bind(this)})
      };
    },
    addObservers: function(){
      this.observers = [
      	this.overlay.element.on('click',          this.replaceEventWith('close')),
    		this.closeButton.on('click',              this.replaceEventWith('close')),
    		this.nextButton.on('click',               this.replaceEventWith('next')),
    		this.prevButton.on('click',               this.replaceEventWith('previous')),
        document.on('click', 'a[rel^=lightbox]',  this.replaceEventWith('show')),
        this.keyboard = document.on('keydown',    onKeyDown.bind(this))
    	];
    },
    previous: function(){
      showImage.call(this, this.activeImage - 1);
    },
    next: function(){
      showImage.call(this, this.activeImage + 1);
    },
    show: function(imageLink){
      this.overlay.show();
      
      var size = this.options.startSize;
      this.element.setStyle(topLeftStyle(size, size)).show();
      this.imageContainer.setStyle({width: size + 'px', height: size + 'px'});
      
      showImage.call(this, getImageNumber.call(this, imageLink));
    },
    close: function() {
      this.images = [];
      this.keyboard.stop();
      this.element.hide();
      this.overlay.hide();
    }
  }
})());