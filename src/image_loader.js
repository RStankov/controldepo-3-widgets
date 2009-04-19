//= require <src/header.js>

CD3.ImageLoader = function(){
	var loader;
	
	function clearLoader(){
		if (loader != null){
			loader.onload	= null;
			loader			= null;
		}
	}
	
	function onLoad(callback){
		clearLoader();
		callback();
	}
	
	return function(src, callback){
		clearLoader();
		
		loader			= new Image();
		loader.onload	= onLoad.curry(callback.curry(src));
		loader.src		= src;
	};
};
CD3.loadImage = CD3.ImageLoader();