CD3.Widget.Base = Class.create(S2.UI.Base, {
  initialize: function(element, options){
    this.element = $(element);
    this.observers = [];
    this.setOptions(options);
    this.setup();
    this.addObservers();
  },
  setup: Function.ABSTRACT,
  removeObservers: function(){
    this.observers.invoke('stop');
    this.observers = [];
  }
});