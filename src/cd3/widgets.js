CD3.Widget = {
  create: function(name, options, methods){
    var widget = Class.create(this.Base, {
      NAME: name
    });
    widget.addMethods(methods);
    widget.DEFAULT_OPTIONS = options;
    return widget;
  }
};

//= require "widgets/base"
//= require "widgets/accordion"
//= require "widgets/drop_down"
//= require "widgets/font_switcher"
//= require "widgets/scroller"
//= require "widgets/slider"