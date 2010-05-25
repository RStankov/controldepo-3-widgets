CD3.Util.createImageLoader = function(callback){
  var image;

	function clearLoader(){
		if (image != null){
			image.onload	= null;
			image			    = null;
		}
	}

	function onLoad(){
		callback(image);
		clearLoader();
	}

  return function(src){
    clearLoader();
    
    image			    = new Image();
		image.onload	= onLoad;
		image.src		  = src;
  };
};
