(function(){
  function skipOneSubmit(e){
    Event.stop(e);
    Event.stopObserving(this, 'submit', skipOneSubmit);
  }
  
  Event.observe(document, 'mousedown', function(event){
    var element = event.findElement(), type = element.type;
    if (element.form && element.tagName.toUpperCase() == 'INPUT'){
      if (type == 'submit'){
        if (Event.fire(element, 'form:submit').stopped){
          Event.observe(element.form, 'submit', skipOneSubmit);
        }
      } else if (type == 'reset'){
        Event.fire(element, 'form:reset');
      }
    }
  });
  
  Event.observe(document, 'keydown', function(event){
    var element = event.findElement(), type = element.type;
    if (element.form && element.tagName.toUpperCase() == 'INPUT' && event.keyCode == Event.KEY_RETURN){
      if (/file|text|password|submit/.test(type)){
        if (Event.fire(element, 'form:submit').stopped){
          Event.observe(element.form, 'submit', skipOneSubmit);
        }
      } else if (type == 'reset'){
        Event.fire(element, 'form:reset');
      }
    }        
  });
})();