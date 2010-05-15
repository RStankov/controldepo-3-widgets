CD3.Widget.Scroller = Class.create(CD3.Widget.Base, {
  NAME: "CD3.Widget.Scroller",
      
  setup: function(){
    this.speed		= this.options.speed;
    this.scroller	= $(this.options.scroller);
    this.handle		= this.scroller.down('.' + this.options.styleSlider);
    
    /*
    // TODO DRAG
    if (options.drag) new Draggable(this.handle,{ 
      constraint:	'vertical', 
      snap:		function(x, y){ return [x, this.validateTopPosition(y)]; }.bind(this),
      change:		this.traceHandlePosition.bind(this)
    });
    */
    
    var trackpath = this.handle.up();

    this.trackpathPositionY = trackpath.cumulativeOffset()[1];
    this.sliderMaxHeight    = trackpath.getHeight() - this.handle.getHeight();
	
    this.checkIfneeded();
  },
  addObservers: function(){
    var stop  = this.stopScroll.bind(this),
        start = this.startScroll.bind(this),
        match = '.' + this.options.styleArrow,
        upArr = this.options.styleMoveUp;

    this.observers = [
      this.scroller.on('mouseup',    match, stop),
      this.scroller.on('mouseout',   match, stop),
      this.scroller.on('mousedown',  match, function(e, element){ start(element.hasClassName(upArr) ? -1 : 1); }),
      this.handle.up().on('click',   this.traceSliderClick.bind(this)),
      this.element.on('mouse:wheel', this.traceMouseWheel.bind(this))
    ];
  },
  startScroll: function(value){
    this.interval = setInterval(this.scrollBy.bind(this, value), 3);
  },
  stopScroll: function(){
    clearInterval(this.interval);
    this.interval = null;
  },
  scrollBy: function(dir){
    this.handle.style.top = this.validateTopPosition( this.getScrollPosition() + dir * this.speed ) + 'px';
    this.traceHandlePosition();
  },
  setHandlePosition: function(){
    this.handle.style.top = (this.sliderMaxHeight * (this.element.scrollTop / this.getVisibleHeight())) + 'px';
  },
  validateTopPosition: function(y){
    return y.constrain(0, this.sliderMaxHeight);
  },
  traceHandlePosition: function(){
    this.element.scrollTop = this.getVisibleHeight() * (this.getScrollPosition() / this.sliderMaxHeight);
  },
  traceMouseWheel: function(e){
    e.stop();
    this.scrollBy(e.memo.delta > 0 ? -15 : 15);			
  },
  traceSliderClick: function(e){
    var clickedY = e.pointerY()  - this.trackpathPositionY,
        top      = this.getScrollPosition(),
        height   = this.handle.getHeight();
        
    if (clickedY < top || ( top+height ) < clickedY){
      new S2.FX.Morph(this.handle, {
        style:        {top: this.validateTopPosition(clickedY) + 'px'},
        duration:     0.5,
        afterUpdate:  this.traceHandlePosition.bind(this)
      }).play();
    }
  },
  getScrollPosition: function(){
    return parseInt(this.handle.style.top) || 0;
  },
  getVisibleHeight: function(){
    return this.element.scrollHeight - this.element.offsetHeight;
  },
  checkIfneeded: function(){
    this.scroller[this.element.scrollHeight > this.element.getHeight() ? 'show' : 'hide']();
  }
});

CD3.Widget.Scroller.DEFAULT_OPTIONS = {
  scroller:       null,
  styleArrow:     'arrow',
	styleMoveUp:    'moveup',
	styleMoveDown:  'movedown',
	styleSlider:    'slider',
	drag:           true,
	speed:          1
};

CD3.Widget.Scroller.createIfNeeded = function(container, scroller, options){
  container  = $(container);

  if (container.scrollHeight <= container.offsetHeight){
    $(scroller).hide();
    return null;
  }
	
  return new this(container, scroller, options);
}