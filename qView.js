/**
Description: qView is in charge of displaying different pages according to callbacks set on different events. It's only dependency is radio.js and it should not execute any bootstrap functions at all, instead it can broadcast an event that triggers qController for bootstrap events and qApp for firebase events.
Usage: qView returns a object called view. When the dom is loaded the main script runs view.init to set up event callbacks and to cache all element referenses it needs. It then sets correct page, navigation items and avaliable buttons. It is also responsible to render lists such as the queue, and to adapt the interface depending on user account type. (A user with a 'LIMITED' type account has fewer actions avaliable to them than a user with a 'EXPANDED' type account. See 'database-schema-overview.json' for all account types.)
**/

/*
	TODO Rewrite all view related code in a revealing module pattern
	TODO Return a object that is instantiated directly (var view =)
	TODO Subscribe to events from q-app.js
	TODO move button elements into controller module
*/

var view = (function( win, doc, radio, undefined ) {

	var pg = {}, nav = {};

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
		nav = {
			load:			document.getElementById("nav-load"),
			main: 		document.getElementById("nav-main"),
			app: 			document.getElementById("nav-app"),
			conf: 		document.getElementById("nav-settings")
		};
	};

	//Displays the passed page and the related nav items. Is set to wait for a css animation so that the transition between pages do not feel abrupt
	function displayPage(page){

		var load = {};

		switch(page){
			case "main":
				load.pg = pg.main;
				load.nav = nav.main;
				break;
			case "app":
				load.pg = pg.app;
				load.nav = nav.app;
				break;
			case "settings":
				load.pg = pg.conf;
				load.nav = nav.conf;
				break;
			default:
				load.pg = pg.load;
				load.nav = nav.load;
				break;
		}

		//TODO Rewrite as forEach function
		var active = {};

		if(pg.load.classList.contains("active")){
			active.pg = pg.load;
			active.nav = nav.load;
		}
		if(pg.main.classList.contains("active")){
			active.pg = pg.main;
			active.nav = nav.main;
		}
		if(pg.app.classList.contains("active")){
			active.pg = pg.app;
			active.nav = nav.app;
		}
		if(pg.conf.classList.contains("active")){
			active.pg = pg.conf;
			active.nav = nav.conf;
		}

		//if the page is different from the one displayed already:
		if(load.pg !== active.pg){
			//setTimeout is there because of how css fade in/out is done
			active.pg.classList.add("fade");
			active.nav.classList.add("fade");
			setTimeout(function(){
				active.pg.classList.remove("active","fade");
				active.nav.classList.remove("active","fade");
				load.pg.classList.add("active");
				load.nav.classList.add("active");
			}, 500);
			//publish the event in case of another module need it
			radio("PAGE_CHANGE").broadcast(load,active);
		}


	};

	//display alert that displays passed msg as passed type
	function displayAlert(){

	};

	function setSubscriptions(){
		radio("LOGGED_OUT").subscribe(function(){
			displayPage("main");
		});
		radio("LOGGED_IN").subscribe(function(){
			displayPage("app");
		});
		radio("LOADING").subscribe(function(){
			displayPage("load");
		});
		radio("SETTINGS").subscribe(function(){
			displayPage("settings");
		});
	};

	return {
		init: init
	};

})( window, document, radio );
