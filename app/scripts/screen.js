var screen = (function(win, doc, Firebase, undefined){

	var root;
	var qOn;
	var no=0;
	var ref = {};

	var queue = [];
	var $queue = $("#container-queue");

	var users = {};

	function init(url){
		root = new Firebase(url);
		ref.users = root.child("users");
		ref.tickets = root.child("tickets");
		ref.app = root.child("app/running");
		
		setAppListeners();
		
		setQueueListener();
	};

	function setAppListeners(){
		ref.users.on("value", function(usersSnapshot){
			users = usersSnapshot.val();
		});
		
	 	ref.app.on("value", function(app) {
			qOn = app.val();
			console.log ( 'running' );
			setQueueListener()
		});
			

	};
	

	function setQueueListener(){
		ref.tickets.on("value", function(tickets){
			queue = [];
			tickets.forEach(function(ticket){
				if(!isNaN(ticket.val().ticket_id) && ticket.val().ticket_id !== 0 ){
					var uid = ticket.key();
					var obj = {
						uid: uid,
						user: users[uid],
						ticket: ticket.val(),
						modVal: modVal = ticket.val().push - ticket.val().pull
					};
					if(queue.length === 0){
						queue.push(obj);
					} else {
						if(ticket.val().ticket_id > queue[queue.length-1].ticket.ticket_id){
							queue.push(obj);
						} else {
							for(var i = 0; i < queue.length; i++){
								if(ticket.val().ticket_id < queue[i].ticket.ticket_id){
									queue.splice(i, 0, obj);
									break;
								}
							}
						}
					}
				}
			});
			drawQueue(queue);
		});
	};

	function drawQueue(){
		$queue.empty();
			no=0;
		if (qOn){
		for(var i = 0; i < queue.length; i++){
		
			no = i+1;
			var name = '<table><tr><td rowspan="2"><strong>'+ no + '</strong></td><td class="list-group-center"><h2>' + queue[i].user.info.first_name +" "+ queue[i].user.info.last_name+", "+ queue[i].user.info.studies+'<h2></td></tr>';
			var est = queue[i].ticket.est + "";
			var location = queue[i].ticket.location + "";
			if (i<=4){
						$queue.append('<li class="list-group-item">' + name +" "+'<tr><td class="list-group-center"><h2><span>'+est+"min @ <em>"+location+'</em></span><h2></td></tr></table></li>');
			}else {
						$queue.append('<div class="queue-over-five"><li class="list-group-item">' + name +" "+'<tr><td class="list-group-center"><h2><span>'+est+"min @ <em>"+location+'</em></span><h2></td></tr></table></li></div>');
			}
		}
		$queue.append('<div class="list-group-total"><h2>&nbsp In Queue:</h2><strong>' +no+'</strong></div>');
		
		}else{
		$queue.append('<li class="list-group-item" ><div id="queueOff"><h2>The queue is not activated <br> Please take any questions to the teachers <h2></div></li>');
		}
	};

	return {
		init: init
	}

})(window, document, Firebase);


