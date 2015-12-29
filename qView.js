/**
Description:
qView is in charge of displaying different pages according to callbacks set on different events. It's only dependency is radio.js and jQuery.
qView returns a object called view. When the dom is loaded the main script runs view.init to set up event callbacks and to cache all element referenses it needs. It then sets correct page, navigation items and avaliable buttons. It is also responsible to render lists such as the queue, and to adapt the interface depending on user account type. (A user with a 'LIMITED' type account has fewer actions avaliable to them than a user with a 'EXPANDED' type account. See 'database-schema-overview.json' for all account types.)
**/

//FIXME if users change name this will currently not reflect in app until refresh.

var view = (function( win, doc, radio, $, undefined ) {

	var pg = {}, nav = {}, $modals, $alerts;

	var user = {};

	function init(){
		cacheDom();
		setSubscriptions();
	};

	function cacheDom(){
		pg = {
			load:			doc.getElementById("page-load"),
			main: 		doc.getElementById("page-main"),
			app: 			doc.getElementById("page-app"),
			conf: 		doc.getElementById("page-settings")
		};
		nav = {
			load:			doc.getElementById("nav-load"),
			main: 		doc.getElementById("nav-main"),
			app: 			doc.getElementById("nav-app"),
			conf: 		doc.getElementById("nav-settings")
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

	//TODO queue templates
	function updateQueue(queue){
		$queue.empty();
		ctrl.removeQueueListener("all");

		var userInQueue = false;
		var userObj = {};
		var userNo = 0;
		var estimation = 0;

		for(var i = 0; i < queue.length; i++){
			console.log(queue[i]);
			var no = i+1;
			var name = '<span class="pull-left">' + no + " " + queue[i].user.info.first_name +" "+ queue[i].user.info.last_name + '</span>';
			var backgroundClass = "";
			if(queue[i].uid === user.uid){
				backgroundClass = "mark-user";
				userInQueue = true;
				userObj = queue[i];
				userNo = no;
			}
			var id = "";
			var btn = "";
			if(queue[i].ticket.est != undefined){
				estimation += queue[i].ticket.est;
			}
			console.log(queue[i].ticket.est);


			switch (user.account){
				case "FULL":
					id = "queue-btn-"+[i];
					btn = '<div class="form-group"><button id="'+id+'" type="button" class="btn btn-xs btn-success pull-right" data-toggle="modal" value="' +queue[i].uid+ '">Help</button></div>';

					//var icons = '<div class="pull-left"><span class="glyphicon glyphicon-ok"></span>'+'<span class="glyphicon glyphicon-ok"></span>'+'<span class="glyphicon glyphicon-ok"></span></div>';
					//var dropdown = '<div class="dropdown"><button id="drop-label" class="pull-right btn btn-default btn-xs dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-cog"></span><span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right" aria-labelledby="drop-label"><li><a href="#"><span class="glyphicon glyphicon-ok text-success"></span> Help</a></li><li role="separator" class="divider"></li><li><a href="#"><span class="glyphicon glyphicon-chevron-up"></span> Move one up</a></li><li><a href="#"><span class="glyphicon glyphicon-chevron-down"></span> Move one down</a></li><li><a href="#"><span class="glyphicon glyphicon-triangle-bottom"></span> Push to last</a></li><li role="separator" class="divider"></li><li><a href="#"><span class="glyphicon glyphicon-remove text-danger"></span> Remove from queue</a></li></ul></div>';
					break;
				case "LIMITED":
					break;
			}
			$queue.append('<li class="list-group-item '+backgroundClass+'">' + name + btn +'</li>');
			ctrl.addQueueListener(id, queue[i].uid);
		}
		if(userInQueue){
			updateTicket(userObj,userNo,estimation);
		} else {
			updateTicket({
				ticket:{
					ticket_id: 0
				}
			},0,0)
		}
	};

	function displayModal(query){
		$(query).modal("show");
	};

	function hideModals(){
		if(doc.body.className.indexOf("modal-open") >= 0){
			$modals.modal("hide");
		}
	};

	function updatedUser(uid,data){
		user = data;
		user.uid = uid;
		doc.getElementById("dropdown-user").innerHTML = data.info.first_name + " " + data.info.last_name;
	};

	//TODO implement number in queue, tags, and estimation of time
	function updateTicket(obj, place, est){
		if(obj.ticket.ticket_id > 0){
			doc.getElementById("queue-header").innerHTML = "Your are in the queue";
			doc.getElementById("queue-number").innerHTML = place;
			doc.getElementById("queue-est").innerHTML = est;
			doc.getElementById("queue-location").innerHTML = obj.ticket.location;
			doc.getElementById("queue-tags").innerHTML = obj.ticket.tags;
		} else {
			doc.getElementById("queue-header").innerHTML = "Your are not in the queue";
			doc.getElementById("queue-number").innerHTML = "";
			doc.getElementById("queue-est").innerHTML = "";
			doc.getElementById("queue-location").innerHTML = "";
			doc.getElementById("queue-tags").innerHTML = "";
		}
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
		radio("USER_DATA").subscribe(function(uid,data){
			//close specific missing info module here
			$('#q-complete-info-modal').modal('hide');
			updatedUser(uid,data);
		});
		radio("QUEUE_UPDATE").subscribe(function(queue){
			updateQueue(queue);
			//updateTicket(queue);
		});
		/*
		radio("TICKET_UPDATE").subscribe(function(ticket){
			updateTicket(ticket);
		});
		*/
	};

	return {
		init,
		hideModals
	};

})( window, document, radio, jQuery );
