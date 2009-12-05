var PROTOTYPE_EVENT_REGISTRY = 'prototype_event_registry',
    DELEGATE_EVENT_REGISTRY  = 'prototype_delegates';

new Test.Unit.Runner({
	setup: function(){},
	teardown: function(){},
	'test storing delegates info in element storage - {eventName: {selectorName: [handlers...]}}': function(){
	  var element = $('test_delegate_save_in_store');
	  
	  Event.delegate(element, 'a',  'click', Prototype.emptyFunction);
	  Event.delegate(element, 'a',  'click', function(){});
	  Event.delegate(element, 'li', 'click', function(){});
	  Event.delegate(element, 'li', 'mouseover', function(){});
	  Event.delegate(element, 'li', 'keypress', function(){});
	  
	  var delegatesStorage  = element.retrieve(DELEGATE_EVENT_REGISTRY);  
	  var eventStorage      = delegatesStorage.get('click');
	  var selectorStorage   = eventStorage.get('a');
	  
	  // have 3 event handlers
	  this.assertEqual(3, delegatesStorage.values().length);
	  
	  // have 2 selector on click
	  this.assertEqual(2, eventStorage.values().length);
	  
	  // have 2 hanlders on click
	  this.assert(Object.isArray(selectorStorage));
	  this.assertEqual(2, selectorStorage.length);
	  this.assertEqual(Prototype.emptyFunction, selectorStorage[0]);
  },
  'test assigning only one event handler per delegate event': function(){
    var element = $('test_number_of_handlers');
    
    Event.delegate(element, 'a',          'click', Prototype.emptyFunction);
    Event.delegate(element, 'li a',       'click', Prototype.emptyFunction);
    Event.delegate(element, 'a.click',    'click', Prototype.emptyFunction);
    Event.delegate(element, 'a.select',   'click', Prototype.emptyFunction);
    Event.delegate(element, 'ul',         'click', Prototype.emptyFunction);
    Event.delegate(element, 'div',        'click', Prototype.emptyFunction);
    
    var registeredEvents = element.retrieve(PROTOTYPE_EVENT_REGISTRY);

    this.assertEqual(1, registeredEvents.keys().length);
    this.assert(registeredEvents.get('click'));
    this.assertEqual(1, registeredEvents.get('click').length);
  },
  'test Event.stopDelegating with one argument': function(){
    // should remove all storage and all event handlers
    element = $('test_stop_delegating_1');
    
    Event.delegate(element, 'a',          'click',      Prototype.emptyFunction);
    Event.delegate(element, 'li a',       'click',      Prototype.emptyFunction);
    Event.delegate(element, 'div',        'click',      Prototype.emptyFunction);
    Event.delegate(element, 'ul',         'mouseout',   Prototype.emptyFunction);
    Event.delegate(element, 'a.click',    'mouseover',  Prototype.emptyFunction);
    Event.delegate(element, 'a.select',   'keypress',   Prototype.emptyFunction);
    
    var registeredEvents = element.retrieve(PROTOTYPE_EVENT_REGISTRY); 
    
    // check registered events
    this.assertEqual(4, registeredEvents.keys().length);
    this.assert(registeredEvents.get('click'));
    this.assertEqual(1, registeredEvents.get('click').length);
    
    Event.stopDelegating(element);
    
    // check clearing delegate handler
    this.assertEqual(0, element.retrieve(DELEGATE_EVENT_REGISTRY).keys().length);
    
    // check clearing the event handlers
    this.assertEqual(0, registeredEvents.get('click').length);
    this.assertEqual(0, registeredEvents.get('mouseout').length);
    this.assertEqual(0, registeredEvents.get('mouseover').length);
    this.assertEqual(0, registeredEvents.get('keypress').length);
  },
  'test Event.stopDelegating with two arguments': function(){
    // should remove selector(2nd argument) delegates throught all events
    element = $('test_stop_delegating_2');
    
    var eventNames = $w('click mouseover mouseout keydown');
    
    eventNames.each(function(eventName){
      Event.delegate(element, 'a',   eventName, Prototype.emptyFunction);
      Event.delegate(element, 'div', eventName, Prototype.emptyFunction);
    });
    Event.delegate(element, 'a', 'keyup', Prototype.emptyFunction);
    
    var storage  = element.retrieve(DELEGATE_EVENT_REGISTRY);
    
    this.assertEqual(eventNames.length + 1, storage.values().length); // 1 is keyup
    
    eventNames.each(function(eventName){
      this.assertEqual(2, storage.get(eventName).values().length);
      this.assertEqual(1, storage.get(eventName).get('a').length);
      this.assertEqual(1, storage.get(eventName).get('div').length);
    }.bind(this));
    
    Event.stopDelegating(element, 'a');
    
    this.assertEqual(eventNames.length, storage.values().length); // keyup should no longer be needed
    this.assert(Object.isUndefined(storage.get('keyup')));
    
    eventNames.each(function(eventName){
      this.assertEqual(1, storage.get(eventName).values().length);
      this.assert(Object.isUndefined(storage.get(eventName).get('a')));
      this.assertEqual(1, storage.get(eventName).get('div').length);
    }.bind(this));
  },
  'test Event.stopDelegating with tree arguments': function(){
    // should remove selector(2nd argument) delegates for given event (3rd argument)
    element = $('test_stop_delegating_3');
    
    Event.delegate(element, 'a',   'click',    Prototype.emptyFunction);
    Event.delegate(element, 'a',   'click',    Prototype.emptyFunction);
    Event.delegate(element, 'a',   'click',    Prototype.emptyFunction);
    Event.delegate(element, 'div', 'click',    Prototype.emptyFunction);
    Event.delegate(element, 'li',  'keypress', Prototype.emptyFunction);
    
    var storage  = element.retrieve(DELEGATE_EVENT_REGISTRY);

    // check store
    this.assertEqual(2, storage.values().length);
    this.assertEqual(2, storage.get('click').values().length);
    this.assertEqual(3, storage.get('click').get('a').length);
    
    Event.stopDelegating(element, 'a', 'click');
    
    // check store
    this.assertEqual(2, storage.values().length);
    this.assertEqual(1, storage.get('click').values().length);
    this.assertEqual(null, storage.get('click').get('a'));
    
    // chekc event handlers
    var eventRegistry = element.retrieve(PROTOTYPE_EVENT_REGISTRY);
  
    this.assertEqual(2, eventRegistry.keys().length);
    this.assertEqual(1, eventRegistry.get('click').length);
  },
  'test Event.stopDelegating with four arguments': function(){
    // should remove specific handler(4rd argument) for given selector (2nd argument) on given eventt (3rd argument)
    element = $('test_stop_delegating_4');
    
    Event.delegate(element, 'a',   'click',    Prototype.emptyFunction);
    Event.delegate(element, 'a',   'click',    function(){});
    Event.delegate(element, 'a',   'click',    function(){});
    Event.delegate(element, 'div', 'click',    Prototype.emptyFunction);
    Event.delegate(element, 'li',  'keypress', Prototype.emptyFunction);

    var storage  = element.retrieve(DELEGATE_EVENT_REGISTRY);
   
    // check store
    this.assertEqual(2, storage.values().length);
    this.assertEqual(2, storage.get('click').values().length);
    this.assertEqual(3, storage.get('click').get('a').length);
    
    Event.stopDelegating(element, 'a', 'click', Prototype.emptyFunction);
    
    this.assertEqual(2, storage.get('click').get('a').length);
    storage.get('click').get('a').each(function(handler){
      this.assert(handler != Prototype.emptyFunction);
    }.bind(this));
  },
  'test exposing delegete methods to document / Event / Element': function(){
    this.assert(document.delegate == Event.delegate.methodize());
    this.assert(Element.delegate == Event.delegate);
    
    this.assert(document.stopDelegating == Event.stopDelegating.methodize());
    this.assert(Element.stopDelegating == Event.stopDelegating);
  }
});
