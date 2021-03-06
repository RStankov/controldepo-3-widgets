CD3.Form.AdjustableTextarea = Class.create({
  initialize: function(textarea){
    this.textarea	  = textarea = $(textarea);
    this.collapsed	= textarea.getHeight();
    this.rows		    = parseInt(this.collapsed / 20);

    var callback = this.ajust.bind(this);

    textarea.observe('keypress',	  callback);
    textarea.observe('input',		    callback);
    textarea.observe('beforepaste', callback);

    textarea.style.height = this.getHeightStyle();
  },
  getHeightStyle: function(){
    return ( this.textarea.value.split("\n").length > this.rows ? this.collapsed * 2 : this.collapsed ) + 'px';
  },
  ajust: function(){
    var height = this.getHeightStyle();
    if (this.textarea.style.height != height){
      new S2.FX.Morph(this.textarea, {
        style:    {height: height},
        duration: 0.5
      }).play();
    }
  }
});