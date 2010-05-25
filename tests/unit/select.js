new Test.Unit.Runner((function(){
	var select;
	
	function getOptions(){
		return $A(select.ul.getElementsByTagName('a'));
	}
	
	function getOptionsCount(){
		return getOptions().length;
	}
					
	return {
		setup: function(){
			$('playground').innerHTML = '<select id="test"><option value="1">1</opition></select>';
			select = new CD3.Form.Select('test');
		},
		teardown: function(){
			if (select){
				select.destroy();
				select = null;
			}
		},
		testAddOption: function(){
			var before = getOptionsCount();
			select.add({value: 2, text: 2});
			this.assertEqual(before + 1, getOptionsCount());
		},
		testRemoveOptions: function(){
			if (getOptionsCount() == 0) {
				select.add({value: 2, text: 2});
			}
			
			this.assert(getOptionsCount() > 0);
			
			select.removeOptions();
									
			this.assert(getOptionsCount() === 0);
		},
		testSetOptions: function(){
			var before = getOptionsCount();
			
			var options = [];
			$(1, before + 4).each(function(v){ options.push({value: v, text: v}) });
			
			select.set(options);
			
			this.assert(before != getOptionsCount());
			
			var current = getOptions();
			for(var i=0; i<current.length; i++){
				this.assertEqual(options[i].text, current[i].innerHTML);
			}
			
			before = current.length;
			
			select.set(options, true);
			
			this.assertEqual(options.length + before, getOptionsCount());
		}
	}
})());