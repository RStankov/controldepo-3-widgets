// fire after dom was loaded, so that there is no delay in the test
Object.extend(Test.Unit.Testcase.prototype, {
	assertCount: function(expected, message){
		this.assertEqual(expected, this.assertions, message);
	},
	mock: function(scope, name, replacement, callback){
		var _previous = scope[name];
		scope[name] = replacement.bind(this);
		callback.call(this);
		scope[name] = _previous;
	},
	mockAjaxRequest: function(replacement, callback){
		this.mock(Ajax, 'Request', replacement, callback);
	}
});

document.observe('dom:loaded', function(){
		new Test.Unit.Runner({
		setup: function(){},
		teardown: function(){},
		testNormalLink: function(){
			this.mockAjaxRequest(function(url, options){
				this.assertEqual($('normal_link').readAttribute('href'), url);
				this.assertEqual('get', options.method);
				this.assertEqual(Object.keys(options).length, 3);
			}, function(){
				$('normal_link').request();
			});
			
			this.assertCount(3);
		},
		testMethodSettingViaDataMethod: function(){
			['post', 'put', 'delete'].each(function(method){
				this.mockAjaxRequest(function(url, options){
					this.assertEqual($('link_method_' + method).readAttribute('href'), url);
					this.assertEqual(method, options && options.method);
					this.assertEqual(Object.keys(options).length, 3);
				}, function(){
					$('link_method_' + method).request();
				});
			}.bind(this));
			
			this.assertCount(3 * 3);
		},
		testMethodSettingViaOptions: function(){
			var methods = ['delete', 'post', 'put'];
			
			['post', 'put', 'delete'].each(function(method, i){
				this.mockAjaxRequest(function(url, options){
					this.assertEqual($('link_method_' + method).readAttribute('href'), url);
					this.assertEqual(methods[i], options && options.method);
					this.assertEqual(Object.keys(options).length, 3);
				}, function(){
					$('link_method_' + method).request({method: methods[i]});
					this.assertNotEqual(methods[i], method);
				});

			}.bind(this));
			
			this.assertCount(3 * 4);
		},
		testConfirmFalse: function(){
			this.mock(window, 'confirm', function(message){
				this.assertEqual($('link_confirm').getAttribute('data-confirm'), message);
				return false
			}, function(){
				this.mockAjaxRequest(function(){
					this.fail("Mocked confirm should always return false"); 
				}, function(){
					$('link_confirm').request();
				});
			});
			
			this.assertCount(1);
		},
		testConfirmTrue: function(){
			this.mock(window, 'confirm', function(message){
				this.assertEqual($('link_confirm').getAttribute('data-confirm'), message);
				return true;
			}, function(){
				this.mockAjaxRequest(function(url){
					this.assertEqual($('link_confirm').readAttribute('href'), url);
				}, function(){
					$('link_confirm').request();
				});
			});
			
			this.assertCount(2);
		},
		testUpdater: function(){
			this.mock(Ajax, 'Updater', function(elementId, url){
				this.assertEqual($('link_update').readAttribute('href'), url);
				this.assertEqual($('link_update').getAttribute('data-update'), elementId);
			}, function(){
				this.mockAjaxRequest(function(url){
					this.assertEqual($('link_confirm').readAttribute('href'), url);
				}, function(){
					$('link_update').request();
				});
			});
			
			this.assertCount(2);
		},
		testAjaxMethodCustomEvent: function(){
		  var calls       = {count: 0},
	        assertEqual = this.assertEqual.bind(this);
	        
		  ['get', 'post', 'put', 'delete'].each(function(method){
		    this.mockAjaxRequest(function(url, options){
					this.assertEqual($('link_method_' + method).readAttribute('href'), url);
					this.assertEqual(method, options && options.method);
					this.assertEqual(Object.keys(options).length, 3);
				}, function(){
				  var link = $('link_method_' + method);
				  link.observe('ajax:' + method, function(e){
	          assertEqual(e.findElement(), $('link_method_' + method));
	          calls[method]   = true;
	          calls['count'] += 1;
	        });
				  link.request();
				});
				
				this.assert(calls[method] === true);
		  }, this);
		  
		  this.assert(calls.count == 4);
		}
	});
});
