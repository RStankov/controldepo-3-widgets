(function(){
  function delegateHandler(e){
    var element = e.element(), elements = element.ancestors ? element.ancestors().concat([element]) : [element];
    ((Element.retrieve(this, 'prototype_delegates') || new Hash()).get(e.eventName || e.type) || []).each(function(pair){
      if (element = Selector.matchElements(elements, pair.key)[0])
        pair.value.invoke('call', element, e); 
    });
  }

  function delegate(element, selector, eventName, handler){
    element = $(element);
        
    var store = Element.retrieve(element, 'prototype_delegates');
    
    if (Object.isUndefined(store)){
      Element.store(element, 'prototype_delegates', store = $H());
    }
    
    var eventStore = store.get(eventName);
    
    if (Object.isUndefined(eventStore)){
      Event.observe(element, eventName, delegateHandler);
      store.set(eventName, new Hash()).set(selector, [handler]);
    } else {
      (eventStore.get(selector) || eventStore.set(selector, [])).push(handler);
    }

    return element;
  }
  
  function clearEvent(element, store, eventName){
    store.unset(eventName);
    Event.stopObserving(element, eventName, delegateHandler);
  };
  
  function clearSelector(element, store, selector, eventName, eventStore){
    eventStore.unset(selector);
    if (eventStore.values().length == 0){
      clearEvent(element, store, eventName);
    }
  }
    
  // stopDelegating(element[, selector[, eventName[, handler]]])
  function stopDelegating(element, selector, eventName, handler){
    element = $(element);

    var store = Element.retrieve(element, 'prototype_delegates');
    if (Object.isUndefined(store)) return;

    switch(arguments.length){
      case 1: store.each(function(pair){ clearEvent(element, store, pair.key); }); break;
      case 2: store.each(function(pair){ clearSelector(element, store, selector, pair.key, pair.value); }); break;
      case 3: 
          var eventStore = store.get(eventName);
          if (eventStore) clearSelector(element, store, selector, eventName, eventStore);
        break;
      default:
      case 4:
        var eventStore = store.get(eventName);
        if (!eventStore) return;

         var selectorStore = eventStore.get(selector);
         if (selectorStore){
            selectorStore = selectorStore.reject(function(c){ return c == handler; });
            if (selectorStore.length > 0){
              eventStore.set(selector, selectorStore);
            } else {
              clearSelector(element, store, selector, eventName, eventStore);
            }          
        }
    }
  }

  // expose
  document.delegate = delegate.methodize();
  document.stopDelegating = stopDelegating.methodize();
  Event.delegate = delegate;
  Event.stopDelegating = stopDelegating;
  Element.addMethods({ delegate: delegate, stopDelegating: stopDelegating });
})();