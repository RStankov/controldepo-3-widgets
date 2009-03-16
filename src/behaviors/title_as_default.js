//= require <src/header.js>
//= require <src/behaviors.js>
// Usage: 
//  CD3.Behaviors({
//   'input[type=text]': CD3.Behaviors.TitleAsDefaultValue
//  });
CD3.Behaviors.TitleAsDefaultValue = {
	focus: function(){ if (this.getValue() == this.getAttribute('title')) this.setValue(''); },
	blur:  function(){ if (this.getValue().length == 0) this.setValue(this.getAttribute('title')); }
};
