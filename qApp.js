//TODO REFACTOR in a revealing module pattern
//TODO USE radio.js to broadcast events

var app = (function( win, doc, Firebase, radio, undefined){

	var ref = {}, user = {}, queue = {};

	function init(url){
		ref.root = new Firebase(url);
		setAuthListener();
	};

	function setAuthListener(){
		ref.root.onAuth(function(authData){
			if(authData){
				radio("LOGGED_IN").broadcast(authData);
				user.uid = authData.uid;
			} else {
				radio("LOGGED_OUT").broadcast();
				user = {};
			}
		});
	};

	return {
		init: init,
		/*
		signup: signup,
		login: login,
		logout: logout
		*/
	};

})( window, document, Firebase, radio );
