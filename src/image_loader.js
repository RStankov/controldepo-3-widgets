//= require "controldepo"

CD3.ImageLoader = function(){
	var loader;
	
	function clearLoader(){
		if (loader != null){
			loader.onload	= null;
			loader			= null;
		}
	}
	
	function onLoad(callback){
		callback(loader);
		clearLoader();
	}
	
	function load(src, callback){
		clearLoader();
		
		loader			= new Image();
		loader.onload	= onLoad.curry(callback);
		loader.src		= src;
	}
	
	if (arguments.length == 2){
		load(arguments[0], arguments[1]);
	}
	
	return load;
};