/**
Decription:
The qApp module is in charge of communication with the database and authenticate/create users. It returns some public function that are explicitly used by the other modules, most often it is qControl that use either app.login or app.logout.
Instead of calling page change when the login method runs, a auth listener (root.onAuth()) is set with a callback that, if auth changes i.e. a user goes from authenticated to not-authenticated, broadcasts this event (LOGGED_IN/LOGGED_OUT) to all modules that subscribe to them. For example qView listens to these events and change to the right view depending on which event it recives.
**/

/*
	TODO Method for change password
	TODO Method for reset password
	TODO Method for change mail
*/

var app = (function( radio, Firebase, undefined){

	var root;
	var ref = {};
	var uid;
	var users;

	var userListenersSet = false;


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
				uid = authData.uid;
				setAppListeners();
				setUserRefs(uid);
				setUserListeners();
			} else {
				radio("LOGGED_OUT").broadcast();
				removeUserListeners();
				uid;
			}
		});
	};

	function setAppListeners(){
		ref.users.on("value", function(usersSnapshot){
			users = usersSnapshot.val();
			// console.log("logging users:");
			// console.log(users);
		});
	};

	function setUserListeners(){

		if(!userListenersSet){

			ref.user.on("value", function(data){
				//first check for missing info, but only when the listener is first set
				var missingInfo = false;
				var infoArr = ["first_name","last_name","studies"];

				for(var i = 0; i < infoArr.length; i++){
					if(!data.child("info/"+infoArr[i]).exists()){
						missingInfo = true;
					}
				}
				if(missingInfo){
					radio("MISSING_INFO").broadcast();
				} else {
					//else or if user change any information make sure this is reflected in the view
					radio("USER_DATA").broadcast(data.val());
				}
			});

			ref.tickets.on("value", function(tickets){
				var queue = [];
				tickets.forEach(function(ticket){
					if(!isNaN(ticket.val().ticket_id) && ticket.val().ticket_id !== 0 ){
						var uid = ticket.key();
						var obj = {
							user: users[uid],
							ticket: ticket.val()
						};
						if(queue.length === 0){
							queue.push(obj);
						} else {
							for(var i = 0; i < queue.length; i++){
								if(ticket.val().ticket_id < queue[i].ticket.ticket_id){
									queue.splice(i, 0, obj);
									break;
								} else {
									queue.push(obj);
									break;
								}
							}
						}
					}
				});
				radio("QUEUE_UPDATE").broadcast(queue);
			});

			ref.ticket.on("value", function(ticket){
				radio("TICKET_UPDATE").broadcast(ticket.val());
			});

			userListenersSet = true;
		}
	};

	function removeUserListeners(){
		if(userListenersSet){
			ref.user.off("value");
			ref.tickets.off("value");
			ref.ticket.off("value");
			userListenersSet = false;
		}
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

	function updateUserData(firstName, lastName, studies){
		ref.user.child("info").update({
			first_name: firstName,
			last_name: lastName,
			studies: studies
		});
	};

	function takeTicket(data){
		ref.ticket.update(data);
		ref.ticket.update({ ticket_id: Firebase.ServerValue.TIMESTAMP });
	};

	function removeTicket(){
		ref.ticket.update({ticket_id: 0});
	};

	return {
		init,
		signup,
		login,
		logout,
		updateUserData,
		takeTicket,
		removeTicket
	};

})( radio, Firebase );
