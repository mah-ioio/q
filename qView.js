/**
Description:
qView is in charge of displaying different pages according to callbacks set on different events. It's only dependency is radio.js and jQuery.
qView returns a object called view. When the dom is loaded the main script runs view.init to set up event callbacks and to cache all element referenses it needs. It then sets correct page, navigation items and avaliable buttons. It is also responsible to render lists such as the queue, and to adapt the interface depending on user account type. (A user with a 'LIMITED' type account has fewer actions avaliable to them than a user with a 'EXPANDED' type account. See 'database-schema-overview.json' for all account types.)
**/

var view = (function( win, doc, radio, $, undefined ) {

	var pg = {}, nav = {}, $modals, $alerts;

	var user = {};

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
		$modals = 	$(".modal");
		$alerts = 	$("#container-alerts");
		$queue = 		$("#container-queue");
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
			//broadcasts an event to indicate beginning changing page
			radio("PAGE_CHANGE").broadcast(load,active);
			//function that closes any open modal (page can change in background however)
			hideModals();
			//set style classes so that page and nav element fade out
			active.pg.classList.add("fade");
			active.nav.classList.add("fade");
			//setTimeout is there because of how css fade in/out is done
			setTimeout(function(){
				active.pg.classList.remove("active","fade");
				active.nav.classList.remove("active","fade");
				load.pg.classList.add("active");
				load.nav.classList.add("active");
			}, 500);
			//broadcasts an event to indicate that the page have been changed
			radio("PAGE_CHANGED").broadcast(load,active);
		}

	};

	//FIXME store all active alerts in an array and remove only the correct one. Right now the timeout callback removes the first #alert-div it finds and this leads to unwanted behaviour.
	//display alert that displays passed msg as passed type
	function displayAlert(msg, type) {
		var wordArr =["Ops!", "Darn!", "Uh-oh...", "Err.", "Hm...", "It's probably not you, but...", "Ehh...", "Great Scott!", "Well...", "What happened?", "Um...", "Why did you think that would work?!", "Come on now...", "Don't be difficult."];

		$alerts.append('<div id="alert-div" class="animated bounce alert fade in ' + type + '"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span><strong>' + wordArr[Math.floor(Math.random() * wordArr.length)] + '</strong> ' + msg + '</span>');

		window.setTimeout(function() {
			$("#alert-div").remove();
		}, 4000);
	};

	function updateQueue(queue){
		for(var i = 0; i < queue.length; i++){
			$queue.append
		}

	};

	function displayModal(query){
		$(query).modal("show");
	};

	function hideModals(){
		if(document.body.className.indexOf("modal-open") >= 0){
			$modals.modal("hide");
		}
	};

	function userUpdated(data){
		user = {
			firstName: data.child("info/first_name").val(),
			lastName: data.child("info/last_name").val(),
			studies: data.child("info/studies").val()
		};
		document.getElementById("dropdown-user").innerHTML = user.firstName + " " + user.lastName;
	};

	function setSubscriptions(){
		radio("LOGGED_OUT").subscribe(function(){
			displayPage("main");
			user = {};
		});
		radio("LOGGED_IN").subscribe(function(){
			displayPage("app");
		});
		radio("MISSING_INFO").subscribe(function(){
			displayModal("#q-complete-info-modal");
		});
		radio("LOADING").subscribe(function(){
			displayPage("load");
		});
		radio("SETTINGS").subscribe(function(){
			displayPage("settings");
		});
		radio("APP").subscribe(function(){
			displayPage("app");
		});
		radio("ALERT").subscribe(function(msg,type){
			displayAlert(msg,type);
		});
		radio("USER_DATA").subscribe(function(data){
			//close specific missing info module here
			$('#q-complete-info-modal').modal('hide');
			userUpdated(data);
		});
		radio("QUEUE_UPDATE").subscribe(function(queue){
			updateQueue(queue);
		});
	};

	return {
		init: init
	};

})( window, document, radio, jQuery );
