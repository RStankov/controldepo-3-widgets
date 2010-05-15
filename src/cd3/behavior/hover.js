// Usage: 
//  CD3.Behaviors({
//   '.menu a': CD3.Behavior.Hover('hoverClass')
//  });
CD3.Behavior.Hover = function(hoverClass, selector){
	return {
		mouseenter: function(){ (selector ? this.down(selector) : this).addClassName(hoverClass || 'hover'); },
		mouseleave:  function(){ (selector ? this.down(selector) : this).removeClassName(hoverClass || 'hover'); }
	};
};
