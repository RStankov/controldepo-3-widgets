Number.prototype.round = function(precision){
	if (Object.isUndefined(precision)){
		return Math.round(this);
	}
	
	precision = Math.pow(10, precision);
		
	return Math.round(this * precision) / precision;
};

Number.prototype.between = function(n1, n2){
  var min = (n1 < n2) ? n1 : n2,
      max = (n1 < n2) ? n2 : n1;
      
  return this >= min && this <= max;
}

Number.prototype.formatted = function(){
	if (!this) return 0;
	
	var sign 	= this < 0 ? '-' : '',
		num		= Math.floor(Math.abs(this)*100+0.50000000001),
		cents	= (num % 100).toString().substring(0, 2);
		
	num = Math.floor(num/100).toString();
	
	for (var i = 0, l = Math.floor((num.length-1)/3), p = 3; i < l; i++, p += 4){
		num = num.substring(0, num.length - p) + ' ' + num.substring(num.length - p);
	}
	
	return sign + num + '.' + (cents < 10 ? '0' + cents : cents);
};