//= require "../behaviors"

// Usage: 
//  CD3.Behaviors({
//   'a[href=^#]': CD3.Behaviors.ScrollTo
//  });
CD3.Behaviors.ScrollTo = {
	click: function(){
		var href = this.getAttribute('href');
		Effect.ScrollTo(href.substr(href.indexOf('#') + 1), { duration: 0.5 });
	}
};