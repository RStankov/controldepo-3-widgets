(function(){
  document.delegate('input[type=text],input[type=file],select,textarea', 'focus', function(){
    this.store('input:current:value', this.getValue());
  });
  document.delegate('input[type=text],input[type=file],select,textarea', 'blur', function(){
    if (this.retrieve('prototype_delegates_current_value') != this.getValue()){
      Event.fire(this, 'input:current:value');
    }
    this.getStorage().unset('input:current:value');
  });
})();