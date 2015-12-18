//TODO REFACTOR in a pubsub pattern

var firebase = {
	root: undefined,
	users: undefined,
	user: undefined
};

var user = {
	name: {
		first: undefined,
		last: undefined
	},
	mail: undefined,
	uid: undefined,
	queue: undefined,
	password: undefined
};

//TODO deactivate signup/login button while incomplete information

$(document).ready( function (){
	app.init();
});

var app = {
	init: function(){
		firebase.root = new Firebase("https://mah-space-mono.firebaseio.com");
		firebase.users = firebase.root.child("users");

		//FIXME seems unneccesary, refactor into something more elegant
		var authD = firebase.root.getAuth();
		if(authD){
			console.log("User with uid:", authD.uid);
			user.uid = authD.uid;
			firebase.user = firebase.users.child(user.uid);
			queue.setListener();
			$("#page-main").toggle();
			$("#page-app").toggle();
		} else {
			console.log("No auth");
			//change view here
		}

		setButtonListeners();

		/**
			Set a listener on the clients auth state and change views
				depending on if authData is null > main page
				or if authData returns the auth object > app page
			No viewchange necessary in login/logout
		**/
		//TODO move page view change into onAuth callback
		firebase.root.onAuth(function(authData){
			if(authData){
				console.log("Authenticated user with uid:", authData.uid);
				user.uid = authData.uid;
				//change view here
			} else {
				console.log("No auth");
				//change view here
			}
		});

	},
	signup: function(){
		user.name.first = $("#signup-first-name").val().toLowerCase();
		user.name.last = $("#signup-last-name").val().toLowerCase();
		user.course = $("#signup-course").val().toLowerCase();
		user.mail = $("#signup-mail").val().toLowerCase();
		user.password = $("#signup-password").val();
		//TODO validate this with firebase security instead IF an error message that is clear for the user can be presented
		if(user.name.first === "" || user.mail === "" || user.password === ""){
			displayAlert("#signup-alert","Please fill out all fields","alert-warning");
		} else {
			auth.signup(user.name.first, user.mail, user.password);
		}
	},
	login: function(){
		user.mail = $("#login-mail").val().toLowerCase();
		user.password = $("#login-password").val();
		auth.login(user.mail, user.password);
	},
	logout: function(){
		firebase.root.unauth();
	},
	getTicket: function(){
		firebase.user.update({ticket: Date.now()});
		toggleTicket();
	},
	removeTicket: function(){
		firebase.user.update({ticket: 0});
		toggleTicket();
	}
}

var auth = {
	//TODO on signup, login user automatically
	signup: function (name, mail, password){
		console.log("signing up "+name+ "...");
		firebase.root.createUser({
			email    : mail,
			password : password
		}, function(error, userData) {
			if (error) {
				switch (error.code) {
					//TODO shake the signup button with animate.css and display error message
					case "INVALID_EMAIL":
						displayAlert("#signup-alert","The specified user account email is invalid","alert-danger");
						console.log("The specified user account email is invalid.");
						break;
					case "EMAIL_TAKEN":
						displayAlert("#signup-alert","The specified user account email is already taken","alert-warning");
						console.log("The specified user account email is already taken");
						break;
					default:
						var err = "Error signing up user:" + error;
						displayAlert("#signup-alert",err,"alert-danger");
						console.log("Error signing up user:", error);
				}
			} else {
				console.log("Successfully created user account with uid:", userData.uid);
				user.uid = userData.uid;

				//TODO set up a new user in firebase
				firebase.user = firebase.users.child(userData.uid);

				firebase.user.set({
					name: {
						first: user.name.first,
						last: user.name.last
					},
					course: user.course,
					ticket: "0",
					account: "limited"
				});

				//TODO log in user automatically after successfully registration
				$("#q-signup-modal").modal("hide");
				$("#q-success-modal").modal("show");

			}
		});
	},
	login: function(mail,password){
		console.log("logging in...");
		var checkbox = $("#login-checkbox:checked").val();
		var rememberMe;
		if(checkbox === true){
			rememberMe = "default";
		} else {
			rememberMe = "sessionOnly";
		}
		firebase.root.authWithPassword({
			email: mail,
			password: password
		}, function(error, authData) {
			if (error) {
				var err = "Error signing in:" + error;
				displayAlert("#login-alert",err,"alert-danger");
				console.log("Login Failed!", error);
			} else {
				console.log("Authenticated successfully with payload:", authData);

				//TODO remove this after signup login user automatically
				user.uid = authData.uid;
				firebase.user = firebase.users.child(user.uid);
				firebase.user.once("value", function(data){
					if(data.val()){
						user.name.first = data.name.first;
						user.name.last = data.name.last;
						user.course = data.course;
						console.log("found data");
					} else {
						console.log("creating data");
						firebase.user.set({
							name: {
								first: "exampleName",//user.name.first,
								last: "exampleNameLast"//user.name.last
							},
							course: "exampleCourse",//user.course,
							ticket: "0",
							account: "limited"
						});
					}

				});

				queue.setListener();

				$("#q-login-modal").modal("hide");
				$("#page-main").toggle();
				$("#page-app").toggle();
			}
		},{
			remember: rememberMe
		}
	);
	}
}

function setButtonListeners(){
	$("#signup-button").on("click", app.signup);
	$("#login-button").on("click", app.login);
	$("#logout-button").on("click", app.logout);
	$("#get-ticket-button").on("click", app.getTicket);
	$("#remove-ticket-button").on("click", app.removeTicket);
}

var queue = {
	arr: [],
	setListener: function(){
		firebase.users.on("value", function(snapshot){
			queue.reset();
			console.log("New queue read");
			snapshot.forEach(function(data){
				if(data.child("ticket").val() != 0 && data.child("ticket").val() !== null){
					//console.log(data.child("ticket").val());
					queue.pushTo(data);
				}
			});
			queue.sortQueue();
			user.queue = queue.findTicket(user.uid);
			queue.draw();
		},function(error){
			console.log("The read failed: " + error.code);
		});
	},
	pushTo: function(obj){
		queue.arr.push({
			/*name: {
				first: obj.child("name/first").val(),
				last: obj.child("name/last").val()
			},*/
			uid: obj.key(),
			ticket: obj.child("ticket").val()
		});
	},
	sortQueue: function(){
		queue.arr.sort(dynamicSort("ticket"));
		//console.log(queue.arr);
	},
	findTicket: function(uid){
		queue.arr.forEach(function(entry, index){
			if(entry.uid === uid){
				$("#current-ticket").empty();
				$("#current-ticket").append("<h4>Your place:</h4><h3>"+(index+1)+"</h3><p>est: 15 min</p>");
				return (index + 1);
			} else {
				$("#current-ticket").empty();
				return 0;
			}
		});
	},
	//TODO draw queue method
	draw: function(){
		$("#queue-div").empty();
		for(var i = 0; i < queue.arr.length; i++){
			var template = [
				'<p>NR ',
				i+1,
				'</p>'
			].join("\n");
		$("#queue-div").append(template);
		}
	},
	reset: function(){
		queue.arr.length = 0;
	}
}

function displayAlert(query, msg, type) {
	var wordArr =["Ops!", "Darn!", "Uh-oh...", "Err.", "Hm...", "It's probably not you, but...", "Ehh...", "Great Scott!", "Well..."];

	$(query).append('<div id="alert-div" class="alert fade in ' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span><strong>' + wordArr[Math.floor(Math.random() * wordArr.length)] + '</strong> ' + msg + '</span>')

	setTimeout(function() {
		$("#alert-div").remove();
	}, 6000);
}

function toggleTicket(){
	$("#get-ticket").toggle();
	$("#remove-ticket").toggle();
}

//FIXME mayby there is a underscore method for this?
//as found at http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
//use as: Array.sort(dynamicSort("property"));
function dynamicSort(property) {
	var sortOrder = 1;
	if(property[0] === "!") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a,b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}


//FIXME if a user takes a ticket the others will lose their queue display, BUG
//TODO implement complete queue item template
//TODO replace Date.now() with Firebase.ServerValue.TIMESTAMP
//TODO incorperate low-dash library
//TODO admin interface
//TODO password reset button and method
//TODO settings menu, change email, change password,
//TODO validate password, at least 4 characters
//TODO write security rule, if logged out > ticket = 0 kanske inte ändå
//TODO accept help notification med tillhörande fb callback som tittar på user event.
//TODO Om user event får ny node visa blockande notification (nått som kan blockera även modaler, typ alert)

//TODO expand ticket node, see below
//TODO set data for new user that includes info
	/*
	user.set({
		ticket: {
			id: timestamp // firebase.servervalue,
			est: "SHORT" || "MEDIUM", //5min or 10 min,
			location: //which room the person is in
			tags: {
				drill: true,
				saw: false,
				...
			}
		}
		account: "LIMITED" || "EXPANDED" || "FULL" || "ADMIN"
							students, can help others if they have correct tags
							tutors, can help anybody regardless of tags, up to themselfs
							teachers, can push and pull queue, help anybody, pause queue
							admin, full read/write
		status: "ACTIVE" || "IDLE" || "BREAK" || "LOGGED_OUT"
							active is written when user make an action in app
							user has logged in but is not participating in any action
							break is written when???
							out means logged out
		info
			first_name
			last_name
			studies: "corse or program"
		licenses
			saw: true,
			drill: false,
			...
		xp: 0,
		events{
			85884092702078264687: {},
			48974982098654928824: {},
			...
		}
	});
	*/
//TODO push data every "event", user take ticket, teacher helped student etc
/*
	user.push({
		time: firebase.ServerValue,
		event: "TICKET" || "SUPPORT" || "LICENSE",
		status: "RESOLVED" || "REMOVED" || "PENDING" || "CREATED",
		uid: active users uid
		tags: {
			saw: true || false,
			drill: true || false,
			...
		},

		location: "string"
		est:
		queue_update: "UP" || "DOWN" || "BOTTOM",
	});
*/
//TODO refactor code: use module pattern for app instead of object literals; split content, style and js; use low-dash templates where appropirate
//TODO comment code

//TODO document db schema, suggestion to have events in their own node so as to not pull down to much data constalntly. Just set a callback on the uid set to child_added
/*
events:{
	uid:{},
	...
},
users:{
	uid:{},
	...
}
*/
