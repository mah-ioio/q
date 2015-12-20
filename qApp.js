/**
Decription:
The qApp module is in charge of communication with the database and authenticate/create users. It returns some public function that are explicitly used by the other modules, most often it is qControl that use either app.login or app.logout.
Instead of calling page change when the login method runs, a auth listener (root.onAuth()) is set with a callback that, if auth changes i.e. a user goes from authenticated to not-authenticated, broadcasts this event (LOGGED_IN/LOGGED_OUT) to all modules that subscribe to them. For example qView listens to these events and change to the right view depending on which event it recives.
**/

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

	function setUserRefs(uid){
		ref.user = ref.users.child(uid);
		ref.ticket = ref.tickets.child(uid);
	};

	function setAuthListener(){
		root.onAuth(function(authData){
			if(authData){
				radio("LOGGED_IN").broadcast(authData);
				user.uid = authData.uid;
				setUserRefs(user.uid);
				setAppListeners();
			} else {
				radio("LOGGED_OUT").broadcast();
				removeAppListeners();
				user = {};
				queue = {};
			}
		});
	};

	function setAppListeners(){
		ref.user.on("value", function(data){
			//if this node is null show welcome modal
			//if user change any information make sure this is reflected in the user object
		});
		ref.tickets.on("value", function(data){

			//filter and sort data
			//empty queue obj
			//set queue obj to filtered and sorted data
			//radio("QUEUE_UPDATE").broadcast(queue);
		});
		ref.ticket.on("value", function(data){

		});
	};

	function removeAppListeners(){
		ref.user.off();
		ref.tickets.off();
		ref.ticket.off();
	};

	function signup(email,password){
		root.createUser({
			email,
			password
		}, function(error, userData) {
			if (error) {
				switch (error.code) {
					case "INVALID_EMAIL":
						radio("ALERT").broadcast("The specified user account email is invalid","alert-danger")
						break;
					case "EMAIL_TAKEN":
						radio("ALERT").broadcast("The specified user account email is already taken","alert-warning")
						break;
					default:
						radio("ALERT").broadcast(error,"alert-danger")
				}
			} else {
				login(email,password,false);
			}
		});
	};

	//logs in a user with email, password and a boolean value.
	//If the boolean (checkbox) is false the session expires on browser closing
	//If it is true it is set to the default log in time which is persistent
	//It does not explicitly call any other function, the auth callback handles the rest of the app setup methods
	function login(email,password,checkbox){

		var rememberMe = "sessionOnly";
		if(checkbox){
			rememberMe = "default";
		}

		root.authWithPassword({
			email,
			password
		}, function(error, authData) {
			if (error) {
				radio("ALERT").broadcast(error,"alert-danger");
			}
		},{
			rememberMe
		});

	};

	function logout(){
		root.unauth();
	};

	function updateInfo(){

	};

	return {
		init,
		signup,
		login,
		logout,
		updateInfo
	};

})( window, document, radio, Firebase );
