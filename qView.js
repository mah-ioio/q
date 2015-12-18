/**
	TODO Rewrite all view related code in a revealing module pattern
	TODO Return a object that is instantiated directly (var view =)
	TODO Use handlebars to load templates
	TODO Subscribe to events from q-app.js
**/

var qView = (function( document, $, undefined ) {
	var view = {
		init: function(){
			this.cacheDom();
		},
		cacheDom: function(){
			this.pg = {
				main: 	document.getElementById("page-main"),
				app: 		document.getElementById("page-app"),
				conf: 	document.getElementById("page-settings")
			},
			this.btn = {
				signup: document.getElementById("signup-button"),
				login: document.getElementById("login-button"),
				logout: document.getElementById("logout-button"),
				get-ticket: document.getElementById("get-ticket-button"),
				remove-ticket: document.getElementById("remove-ticket-button")
			}
		},
		renderQueue: function(){
			//Compare current queue arr with new queue arr
			//Only modify effected elements
			//OR
			//Reset whole queue
			//Redraw completly
		},
		//public
		setSubscriptions: function(){

		}
	};
	view.init();
})( document, jQuery);
