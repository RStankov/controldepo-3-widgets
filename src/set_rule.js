//= require "controldepo"

CD3.setRule = function(selector, styles){
	var i, x, sheet, rules;

	for (x = document.styleSheets.length - 1; 0 <= x ; x--){
		sheet = document.styleSheets[x];
		rules = sheet.cssRules || sheet.rules;
		
		for (i = rules.length - 1; 0 <= i; i--){
			if (rules[i].selectorText == selector){
				return Object.extend(rules[i].style, styles);
			}
		}
	}
	
	var index = rules.length;
	if (sheet.insertRule){ // Normal browsers
		sheet.insertRule(selector + '{ }', index);
	} else /* if (sheet.addRule) */ { // IE
		sheet.addRule(selector, ';', index);
	}
	
	Object.extend((sheet.cssRules || sheet.rules)[index].style, styles);
}