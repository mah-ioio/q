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
			signup: 	document.getElementById("signup-button"),
			login: 		document.getElementById("login-button"),
			logout: 	document.getElementById("logout-button"),
			getTick: 	document.getElementById("get-ticket-button"),
			rmTick: 	document.getElementById("remove-ticket-button"),
			conf:			document.getElementById("settings-button"),
			confB:		document.getElementById("back-button"),
			about:		document.getElementById("about-button"),
			bug:			document.getElementById("bug-button"),
			pwdRes:		document.getElementById("reset-password-button"),
			compl:		document.getElementById("complete-info-button")
		};
		form = {
			signup:		document.getElementById("form-signup"),
			login:		document.getElementById("form-login"),
			ticket:		document.getElementById("form-ticket"),
			compl: 		document.getElementById("form-complete")
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
			if(form.login[i].tagName == "INPUT"){
				data[i] = form.compl[i].value;
			}
		}
		app.updateUserData(data[0],data[1],data[2]);
	}

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
			console.log("CLICKED!!!");
		});
		btn.rmTick.addEventListener("click", function(){
			console.log("CLICKED!!!");
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
