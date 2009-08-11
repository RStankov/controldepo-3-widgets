/*
	Selectors to test:
	  * normal selector
	  * class initializers
		 - direct
		 - with options
	  * event-selector
		 - single event
		 - multiple events
	  * event-delegation-selector
		 - single delegation event (event-selector)
		 - multiple delegation events
	  * multiple selectors
		 - handler
		 - event

	CD3.Behaviors calls variations
		* rules (default)
		* function
		* selector, rules
		* selector, function
	
*/
// fire after dom was loaded, so that there is no delay in the test
Object.extend(Test.Unit.Testcase.prototype, {
	assertCount: function(expected, message){
		this.assertEqual(expected, this.assertions, message);
	}
});

document.observe('dom:loaded', function(){
	// shortcut for CD3.Behaviors
	var $b = CD3.Behaviors;
		
	new Test.Unit.Runner({
	   	testNormalSelector: function(){
	   		var assert = this.assert.bind(this);	
	   		$b({
	   			'#test-normal-selector': function(element){
	   				assert(Object.isElement(element));
	   				assert(element == this);
	   				assert(element.id  == "test-normal-selector");
	   			},
	   			'#test-normal-selector a': function(element){
	   				assert(Object.isElement(element));
	   				assert(element == this);
	   				assert(element.match('#test-normal-selector a'));
	   			},
	   			'#test-normal-selector span': function(){
	   				assert(false);
	   			}
	   		});

	   		this.assertCount(($$('#test-normal-selector').length + $$('#test-normal-selector a').length)*3);
	   	},
	   	testClassInitializer: function(){
	   		var assert = this.assert.bind(this);
   		
			// just create a class from intialize method
			// used in class initializers
			function $c(initializer){
				return Class.create({
					initialize: initializer
				});
			}
			
	   		var TestClass1 = $c(function(element){
	   			assert(Object.isElement(element));
	   			assert(element.match("#test-class-initializer a.first"));
	   			assert(arguments.length == 1);
	   		});
   		
	   		var TestCase2 = $c(function(element, options){
	   			assert(Object.isElement(element));
	   			assert(element.match("#test-class-initializer a.second"));
	   			assert(options == 'options_string');
	   			assert(arguments.length == 2);
	   		});
   		
	   		var TestCase3 = $c(function(){
	   			this.assert(false, "#test-class-initializer a.none do not exists");
	   		});
   		
	   		$b({
	   			'#test-class-initializer a.first':	TestClass1,
	   			'#test-class-initializer a.second':	[TestCase2, 'options_string'],
	   			'#test-class-initializer a.none':	TestClass1
	   		});
   		
	   		this.assertCount(7);
	   	},
	   	testEventSelector: function(){
	   		var assert = this.assert.bind(this);
   		
	   		// mock Event.observe
	   		var eventObserve = Event.observe;
   		
			// create event handler mock object
			// user in event-selector / event-delegation-selector
			function $h(selector, eventName, value){
				value = value || "[no-value]";
				return Object.extend(function(){ return value; }, {
					selector: 	 selector, 
					eventName:   eventName,
					returnValue: value
				});
			};
			
	   		Event.observe = function(element, eventName, handler){
	   			assert(Object.isElement(element),		 "element value must be DOM Element" );
	   			assert(element.match(handler.selector),	 "element do not match given selector " + handler.selector);
	   			assert(handler.eventName == eventName,	 "different eventName given:" + eventName + ", expected: " + handler.eventName);
	   			assert(handler.returnValue == handler(), "unexpected handler value");
	   		};
   		
	   		$b({
	   			'#test-event-selector a:click': $h('#test-event-selector a:click', 'click', 1),
	   			'#test-event-selector a.last': {
	   				mouseover: $h('#test-event-selector a.last', 'mouseover', 2),
	   				mouseout:  $h('#test-event-selector a.last', 'mouseout', 3)
	   			}
	   		});
   		
	   		// unmock Event.observe
	   		Event.observe = eventObserve;
   		
	   		this.assertCount($$('#test-event-selector a:click').length * 4 + $$('#test-event-selector a.last').length * 4 * 2);
	   	},
		testEventSelectorWithCustomEvents: function(){
	   		var assert = this.assert.bind(this);
			
	   		// mock Event.observe
	   		var eventObserve = Event.observe;
	
			Event.observe = function(element, eventName, handler){
				assert(eventName, 'custom:event');
			};
	
			$b({
				'#test-event-selector:custom:event': 	Prototype.emptyFunction,
				'#not-existing-element:custom:event':	Prototype.emptyFunction
			});
			
	   		// unmock Event.observe
	   		Event.observe = eventObserve;
			
			this.assertCount(1);
		},
	   	testEventDelegation: function(){
	   		var assert = this.assert.bind(this);
   	
			// mock Event.delegate
			var eventDelegate = Event.delegate;
			
			Event.delegate = function(element, selector, eventName, handler){
				assert(Object.isElement(element));
	   			assert(element.match(handler.root));
				assert(handler.selector == selector);
	   			assert(handler.eventName == eventName);
	   			assert(handler.returnValue == handler());
			};
			
			// create event handler mock object
			// user in event-selector / event-delegation-selector
			function $h(root, selector, eventName, value){
				value = value || "[no-value]";
				return Object.extend(function(){ return value; }, {
					root: 	  	 root,
					selector: 	 selector, 
					eventName:   eventName,
					returnValue: value
				});
			};
			
			$b({
				'#test-event-delegation:click': {
					'ul': $h('#test-event-delegation:click', 'ul', 'click', 1),
					'li': $h('#test-event-delegation:click', 'li', 'click', 2),
					'a':  $h('#test-event-delegation:click', 'a',  'click', 3),
				},
				'#test-event-delegation': {
					mouseover: {
						'ul': $h('#test-event-delegation:click', 'ul', 'mouseover', 4),
						'li': $h('#test-event-delegation:click', 'li', 'mouseover', 5),
						'a':  $h('#test-event-delegation:click', 'a',  'mouseover', 6),
					},
					mouseout: {
						'ul': $h('#test-event-delegation:click', 'ul', 'mouseout', 7),
						'li': $h('#test-event-delegation:click', 'li', 'mouseout', 8),
						'a':  $h('#test-event-delegation:click', 'a',  'mouseout', 9),
					}
				}
			})
			
			// unmock Event.delegate
			Event.delegate = eventDelegate;
			
			var expectedAsserts = $$('#test-event-delegation').length;
				
			expectedAsserts *= 3; // for 3 sub-selectors: ul, li, a
			expectedAsserts *= 3; // for 3 events: click, mouseover, mouseout
			expectedAsserts *= 5; // for 5 assert in the mocked Event.delegate
			
			this.assertCount(expectedAsserts);
	   	},
		testMultiSelectors: function(){
			var assert = this.assert.bind(this), elements = { span: false, div: false, img: false};
			
			$b({
				// note span, div exists, img not
				'#test-muli-select span, #test-muli-select div, #test-muli-select img': function(element){
					assert(element == this);
					assert(Object.isElement(element));
					
					elements[element.tagName.toLowerCase()] = true;
				}
			});
			
			this.assertCount($$('#test-muli-select span, #test-muli-select div').length * 2);
			
			assert(elements.span);
			assert(elements.div);
			assert(elements.img === false);
		},
		testMultiSelectorsWithEvents: function(){
			var assert = this.assert.bind(this), elements = { span: false, div: false, img: false};
				
			// mock Event.observe
	   		var eventObserve = Event.observe;
			
	   		Event.observe = function(element, eventName, handler){
	   			assert(Object.isElement(element),		"element value must be DOM Element" );
	   			assert('click' == eventName,	 		"different eventName given:" + eventName + ", expected: click ");
	   			assert('value' == handler(), 			"unexpected handler value");
				
				elements[element.tagName.toLowerCase()] = true;
	   		};
			
			$b({
				'#test-muli-select span, #test-muli-select div, #test-muli-select img:click': function(){ return 'value'; }
			});
			
			// unmock Event.observe
			Event.observe = eventObserve;
		
			this.assertCount($$('#test-muli-select span, #test-muli-select div').length * 3);
			
			assert(elements.span);
			assert(elements.div);
			assert(elements.img === false);
		},
		testBehaviorsWithFunctionsAsFirtArgument: function(){
			var assert = this.assert.bind(this), passed = false;
			$b(function(root){
				passed = true;
			
				assert(document === root);
				assert(document === this);
				return {
					'a': function(element){
						assert(Object.isElement(element));
						assert(this == element);
						assert(element.match('a'));
					},
					'img': function(element){
						assert(false, "there are no img element in the page");
					}
				}
			});
			
			this.assertCount($$('a').length * 3 + 2);
			this.assert(passed);
		},
		testBehaviorsWhitTwoArguments: function(){
			var assert = this.assert.bind(this);
			
			$b('#test-existing-element', {
				'a': function(element){
					assert(Object.isElement(element));
					assert(this == element);
					assert(element.match('a'));
				},
				'span': function(element){
					assert(false, "there are no span element in #test-existing-element");
				}
			});
			
			$b('#test-not-existing-element', {
				'a': function(element){
					asset(false, "#test-not-existing-element do not exists in the DOM");
				},
				'span': function(element){
					assert(false, "#test-not-existing-element do not exists in the DOM");
				}
			});
			
			this.assertCount($$('#test-existing-element a').length * 3);
		},
		testBehaviorsWithFunctionsAsSecondArgument: function(){
			var assert = this.assert.bind(this);
			
			$b('#test-existing-element', (function(root){
				passed = true;
			
				assert($('test-existing-element') === root);
				assert($('test-existing-element') === this);
				
				return {
					'a': function(element){
						assert(Object.isElement(element));
						assert(this == element);
						assert(element.match('a'));
					},
					'span': function(element){
						assert(false, "there are no span element in #test-existing-element");
					}
				};
			}));
			
			$b('#test-not-existing-element', function(){
				asset(false, "#test-not-existing-element do not exists in the DOM");
				
				return {
					'a': function(element){
						asset(false, "#test-not-existing-element do not exists in the DOM");
					},
					'span': function(element){
						assert(false, "#test-not-existing-element do not exists in the DOM");
					}
				};
			});
			
			this.assertCount($$('#test-existing-element a').length * 3 + 2);
			this.assert(passed);
		}
   });
});