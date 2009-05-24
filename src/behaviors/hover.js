//= require "../behaviors"

// Usage: 
//  CD3.Behaviors({
//   '.menu a': CD3.Behaviors.Hover('hoverClass')
//  });
CD3.Behaviors.Hover = function(hoverClass, selector){
	return {
		mouseover: function(){ (selector ? this.down(selector) : this).addClassName(hoverClass || 'hover'); },
		mouseout:  function(){ (selector ? this.down(selector) : this).removeClassName(hoverClass || 'hover'); }
	};
};
