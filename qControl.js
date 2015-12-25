/**
Description:
qControl returns an ctrl object with one avaliable public method, ctrl.init(). When this is run, like the two other methods, it parse the dom once and save refereneces to all elements it will need to function. It sets listeners and callbacks on all buttons that do not control modals directly. Modal show/hide is mostly controlled by binding attributes in the HTML and these specific buttons do not need to be cached or controlled by this module.
It also handles form validation and then sends validated data directly to qApp. This connections makes qControl dependent on qApp. However, for the sake of code clarity, this small sidestep from a strict pub/sub implementation is, for now atleast, acceptable.
**/

var ctrl = (function( win, doc, radio, $, undefined ) {

	var btn = {}, form = {}, modals = [];

	function init(){
		cacheDom();
		setListeners();
	};

	function cacheDom(){
		btn = {
			//TODO add all buttons
			signup: 	doc.getElementById("signup-button"),
			login: 		doc.getElementById("login-button"),
			logout: 	doc.getElementById("logout-button"),
			getTick: 	doc.getElementById("get-ticket-button"),
			rmTick: 	doc.getElementById("remove-ticket-button"),
			conf:			doc.getElementById("settings-button"),
			confB:		doc.getElementById("back-button"),
			about:		doc.getElementById("about-button"),
			bug:			doc.getElementById("bug-button"),
			pwdRes:		doc.getElementById("reset-password-button"),
			compl:		doc.getElementById("complete-info-button")
		};
		form = {
			signup:		doc.getElementById("form-signup"),
			login:		doc.getElementById("form-login"),
			ticket:		doc.getElementById("form-ticket"),
			compl: 		doc.getElementById("form-complete")
		};
	};

	//TODO try/catch around all validation methods to keep unexcpected results from breaking the program
	//FIXME find a better way of getting values from a form, maybe an generic method for all forms?
	function signupValidation(){
		var data = [];
		for(var i = 0; i < form.signup.length; i++){
			if(form.signup[i].tagName == "INPUT"){
				data[i] = form.signup[i].value;
			}
		}
		if(data[0] != "" && data[1] != "" && data[2] != ""){
			if(data[1] === data[2]){
				if(data[1].length > 3){
					app.signup(data[0], data[1]);
				} else {
					radio("ALERT").broadcast("Password must be minimum 4 characters.", "alert-danger");
				}
			} else {
				radio("ALERT").broadcast("Please correct your password.", "alert-warning");
			}
		} else {
			radio("ALERT").broadcast("Please fill in all fields.", "alert-warning");
		}
	};

	function loginValidation(){
		var data = [];
		for(var i = 0; i < form.login.length; i++){
			if(form.login[i].tagName == "INPUT"){
				data[i] = form.login[i].value;
			}
		}
		app.login(data[0],data[1]);
	};

	function completeInfoValidation(){
		var data = [];
		for(var i = 0; i < form.compl.length; i++){
			if(form.compl[i].tagName == "INPUT"){
				data[i] = form.compl[i].value;
			}
		}
		app.updateUserData(data[0],data[1],data[2]);
	};

	function ticketValidation(){
		//set default ticket values
		var ticketData = {
			est: 5,
			location: "workshop",
			tags: {
				workshop_machines: false,
				ddd_printer: false,
				laser_cutter: false,
				other_questions: false
			}
		};

		var formData = form.ticket.getElementsByClassName("active");
		var locationData = form.ticket[4].value;

		ticketData.location = locationData;

		for(item in formData){
			switch(item) {
				case "workshop-machines":
					ticketData.tags.workshop_machines = true;
					break;
				case "laser-cutter":
					ticketData.tags.laser_cutter = true;
					break;
				case "3d-printer":
					ticketData.tags.ddd_printer = true;
					break;
				case "other-questions":
					ticketData.tags.other_questions = true;
					break;
				case "5min":
					ticketData.est = 5;
					break;
				case "10min":
					ticketData.est = 10;
					break;
				default:
					break;
			}
		};

		//TODO check if atleast one tag is clicked, if not alert user

		app.takeTicket(ticketData);
		view.hideModals();

	};

	function setListeners(){
		btn.signup.addEventListener("click", function(){
			signupValidation();
		});
		btn.login.addEventListener("click", function(){
			loginValidation();
		});
		btn.logout.addEventListener("click", function(){
			app.logout();
		});
		btn.getTick.addEventListener("click", function(){
			ticketValidation();
		});
		btn.rmTick.addEventListener("click", function(){
			app.removeTicket();
			view.hideModals();
		});
		btn.conf.addEventListener("click", function(){
			radio("SETTINGS").broadcast();
		});
		btn.confB.addEventListener("click", function(){
			radio("APP").broadcast();
		});
		btn.about.addEventListener("click", function(){
			console.log("CLICKED!!!");
		});
		btn.bug.addEventListener("click", function(){
			console.log("CLICKED!!!");
		});
		btn.pwdRes.addEventListener("click", function(){
			console.log("CLICKED!!!");
		});
		btn.compl.addEventListener("click", function(){
			completeInfoValidation();
		});
	};

	return {
		init: init
	};

})( window, document, radio, jQuery );
