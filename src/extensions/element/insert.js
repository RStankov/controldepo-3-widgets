Element._insertionTranslations.into = function(element, node){
	node.appendChild(element);
};

Element._insertionTranslations.instead = function(element, node){
	node.parentNode.replaceChild(element, node);
};

Element.addMethods({
    insert: Element.insert.wrap(function(insert, element, insertation){
        if (!Object.isArray(insertation)) return insert(element, insertation);

        element = $(element);
        insertation.each(insert.curry(element));
        return element;
    })
});
