

var screen = (function(win, doc, Firebase, undefined){

	var root;
	var ref = {};

	function init(url){
		root = new Firebase(url);
		ref.tickets = root.child("tickets");
	};

	return {
		init
	}

})(window, document, Firebase);
