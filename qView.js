/**
	TODO Rewrite all view related code in a revealing module pattern
	TODO Return a object that is instantiated directly (var view =)
	TODO Subscribe to events from q-app.js
**/

var view = (function( win, doc, radio, undefined ) {

	var pg = {}, btn = {};

	function init(){
		cacheDom();
		setSubscriptions();
	};

	function cacheDom(){
		pg = {
			load:			document.getElementById("page-load"),
			main: 		document.getElementById("page-main"),
			app: 			document.getElementById("page-app"),
			conf: 		document.getElementById("page-settings")
		};
		btn = {
			signup: 	document.getElementById("signup-button"),
			login: 		document.getElementById("login-button"),
			logout: 	document.getElementById("logout-button"),
			getTick: 	document.getElementById("get-ticket-button"),
			rmTicki: 	document.getElementById("remove-ticket-button")
		};
	};

	//hide every page except the passed page
	function displayPage(page){

		var active;
		if(pg.load.classList.contains("active")){
			active = pg.load;
		}
		if(pg.main.classList.contains("active")){
			active = pg.main;
		}
		if(pg.app.classList.contains("active")){
			active = pg.app;
		}
		if(pg.conf.classList.contains("active")){
			active = pg.conf;
		}

		active.classList.add("fade");
		setTimeout(function(){
			active.classList.remove("active","fade");
			page.classList.add("active");
		}, 1000);

	};

	function setSubscriptions(){
		console.log("set subscribe");
		radio("LOGGED_OUT").subscribe(function(){
			displayPage(pg.main);
		});
		radio("LOGGED_IN").subscribe(function(){
			displayPage(pg.app);
		});
	};

	return {
		init: init
	};

})( window, document, radio );
