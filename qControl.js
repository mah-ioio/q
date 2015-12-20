
var ctrl = (function( win, doc, radio, undefined ) {

	var btn = {};

	function init(){
		cacheDom();
		setSubscriptions();
	};

	function cacheDom(){
		btn = {
			signup: 	document.getElementById("signup-button"),
			login: 		document.getElementById("login-button"),
			logout: 	document.getElementById("logout-button"),
			getTick: 	document.getElementById("get-ticket-button"),
			rmTicki: 	document.getElementById("remove-ticket-button")
		};
	};

	function setSubscriptions(){
	};

	return {
		init: init
	};

})( window, document, radio );
