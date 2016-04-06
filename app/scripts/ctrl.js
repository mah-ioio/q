/**
Description:
qControl returns an ctrl object with one avaliable public method, ctrl.init(). When this is run, like the two other methods, it parse the dom once and save refereneces to all elements it will need to function. It sets listeners and callbacks on all buttons that do not control modals directly. Modal show/hide is mostly controlled by binding attributes in the HTML and these specific buttons do not need to be cached or controlled by this module.
It also handles form validation and then sends validated data directly to qApp. This connections makes qControl dependent on qApp. However, for the sake of code clarity, this small sidestep from a strict pub/sub implementation is, for now atleast, acceptable.
**/

var ctrl = (function( win, doc, radio, $, undefined ) {

	var btn = {}, form = {}, modals = [], queueListeners = [];

	var currentTicket;
	var user = {};

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
			//about:		doc.getElementById("about-button"),
			bug:			doc.getElementById("bug-button"),
			pwdRes:		doc.getElementById("password-reset-accept-button"),
			compl:		doc.getElementById("complete-info-button"),
			clearTick:doc.getElementById("clear-ticket-button"),
			cInfo:		doc.getElementById("confirm-change-info-button"),
			cEmail:		doc.getElementById("confirm-change-email-button"),
			cPwd:			doc.getElementById("confirm-change-password-button"),
			onOff:		doc.getElementById("turn-onoff-button")
		};
		form = {
			signup:		doc.getElementById("form-signup"),
			login:		doc.getElementById("form-login"),
			reset:		doc.getElementById("form-reset"),
			ticket:		doc.getElementById("form-ticket"),
			compl: 		doc.getElementById("form-complete"),
			bug:			doc.getElementById("form-bug"),
			cInfo:		doc.getElementById("form-info-change"),
			cEmail:		doc.getElementById("form-email-change"),
			cPwd:			doc.getElementById("form-password-change")
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

	function changeInfoValidation(){
		var data = [];
		data[0] = user.info.first_name;
		if(form.cInfo[0].value != ""){
			data[0] = form.cInfo[0].value;
		}
		data[1] = user.info.last_name;
		if(form.cInfo[1].value != ""){
			data[1] = form.cInfo[1].value;
		}
		data[2] = user.info.studies;
		if(form.cInfo[2].value != ""){
			data[2] = form.cInfo[2].value;
		}

		app.updateUserData(data[0],data[1],data[2]);
	};

	function changeEmailValidation(){
		if(form.cEmail[0].value != "" && form.cEmail[1].value != "" && form.cEmail[2].value != ""){
			app.changeEmail(form.cEmail[0].value, form.cEmail[1].value, form.cEmail[2].value);
		} else {
			radio("ALERT").broadcast("Please fill in all fields.", "alert-warning");
		}
	}

	function changePasswordValidation(){
		if(form.cPwd[0].value != "" && form.cPwd[1].value != "" && form.cPwd[2].value != ""){
			app.changePassword(form.cPwd[0].value, form.cPwd[1].value, form.cPwd[2].value);
		} else {
			radio("ALERT").broadcast("Please fill in all fields.", "alert-warning");
		}
	}

	function ticketValidation(){
		//set default ticket values
		var ticketData = {
			ticket_id: Firebase.ServerValue.TIMESTAMP,
			est: 5,
			location: "workshop",
			tags: {
				workshop_machines: false,
				ddd_printer: false,
				laser_cutter: false,
				other_questions: false
			},
			push: 0,
			pull: 0
		};

		ticketData.location = form.ticket[0].value;

		if($('#10min').is(":checked")){
			ticketData.est = 10;
		}

		/*


		var formData = form.ticket.getElementsByClassName("active");
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

		};*/

		if(ticketData.location != ""){
			app.takeTicket(ticketData);
			view.hideModals();
		} else {
			radio("ALERT").broadcast("Please select location.", "alert-danger");
		}

	};

	function bugValidation(){
		app.reportBug(form.bug[0].value);
		view.hideModals();
		$("#q-report-success-modal").modal("show");
		$('#bug-msg').val("");
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
			app.removeTicket("user");
			view.hideModals();
		});
		btn.conf.addEventListener("click", function(){
			radio("SETTINGS").broadcast();
		});
		btn.confB.addEventListener("click", function(){
			radio("APP").broadcast();
		});
		/*btn.about.addEventListener("click", function(){
			console.log("CLICKED!!!");
		});*/
		btn.bug.addEventListener("click", function(){
			bugValidation();
		});
		btn.pwdRes.addEventListener("click", function(){
			app.resetPassword(form.reset[0].value);
		});
		btn.compl.addEventListener("click", function(){
			completeInfoValidation();
		});
		btn.clearTick.addEventListener("click", function(){
			app.removeTicket(currentTicket.uid);
		});
		btn.cInfo.addEventListener("click", function(){
			changeInfoValidation();
		});
		btn.cEmail.addEventListener("click", function(){
			changeEmailValidation();
		});
		btn.cPwd.addEventListener("click", function(){
			changePasswordValidation();
		});
		btn.onOff.addEventListener("click", function(){
			app.toggleOnOff();
		});

		radio("USER_DATA").subscribe(function(uid,data){
			user = data;
		});

	};


	function addQueueListener(id, uid){
		//TODO add new object to queueListeners array for easy removal later

		var target = doc.getElementById(id);
		queueListeners.push({
			el: target,
			id: id,
			uid: uid
		});
		target.addEventListener("click", function(){queueCallback(uid)});
	};

	function queueCallback(uid){
		app.removeTicket(uid);
		console.log("userid = "+uid);
	};

	function removeQueueListener(cmd){
		if(cmd === "all"){
			queueListeners.forEach(function(element, index, array){
				element.el.removeEventListener("click", function(){queueCallback});
			});
			queueListeners = [];
		}
	};

	function setClearListener(ticket){
		if(ticket !== undefined){
			currentTicket = ticket;
		}
	};

	return {
		init: init,
		addQueueListener: addQueueListener,
		removeQueueListener: removeQueueListener,
		setClearListener: setClearListener
	};

})( window, document, radio, jQuery );
