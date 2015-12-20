//TODO REFACTOR in a revealing module pattern
//TODO USE radio.js to broadcast events

var app = (function( win, doc, radio, Firebase, undefined){

	var root;
	var ref = {}, user = {}, queue = {};

	function init(url){
		root = new Firebase(url);
		setRefs(root);
		setAuthListener();
	};

	function setRefs(root){
		ref.users = root.child("users");
		ref.tickets = root.child("tickets");
	};

	function setAuthListener(){
		root.onAuth(function(authData){
			if(authData){
				radio("LOGGED_IN").broadcast(authData);
				user.uid = authData.uid;
				ref.user = ref.users.child(user.uid);
				ref.ticket = ref.tickets(user.uid);
				setAppListeners();
			} else {
				radio("LOGGED_OUT").broadcast();
				ref = {};
				user = {};
				queue = {};
			}
		});
	};

	function setAppListeners(){
		ref.tickets.on("value", function(data){

			//filter and sort data
			//empty queue obj
			//set queue obj to filtered and sorted data
			//radio("QUEUE_UPDATE").broadcast(queue);
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

})( window, document, radio, Firebase );
