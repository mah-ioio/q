!!goal!! App is not allowed to have any references to bootstrap or jquery so that these dependencies can later be removed. Functions relating to the view must be written so that they can be used with any library

Should write this app in a pubsub pattern and let all functions handling views subscribe to these topics and have a callback fired when publishing to these topics within the app


init - public
	set firebase references
	set auth listener
		callback
			if auth
				loggedIn()
				publish(event: loggedIn, payload: user obj)

			if !auth
				publish(event: loggedIn, payload: user obj)
				loggedOut()

loggedIn() - private
	set user references
	set $uid listener
		callback
			if !user
				publish(event: firstLogin)
			else
				set user obj
	set ... listener
	set users listener onChange
		callback
			status changed?
	get game.rules once


loggedOut() - private
	remove ... listeners


login() - public
	auth
	if error return error
	if successful return true

logout() - public
	deauth
	if error return error
	if successful return true

signup()
	create new user account

getUser() // returns user obj, PUBLIC


var rules = {}

ref{
	root
	users
	user
	tickets
	logs
	game {
		user
		rules
	}
}

user{}

queue{}


WHEN LOADING:

html renders
dependencies loads

q-app loads
q-view loads

//app is a pubsub module
//view is a revealing module
//both need to be self executing so they are instantiated

when document ready
	q-view.setSubscriptions() //sets its listeners, dependent on app
	q-app.run() //sets its listeners, dependent on firebase, but must also be able to publish to view directly on

//view is dependent on app to create subscriptions
//app in turn needs to tell view about wether the user is auth or not


//PARTS

q-app // control and sets callbacks for firebase

pubsub // simple js for letting modules subscribe/publish

q-view // control views and redraws, sets listeners on input events and q-app subscriptions

modules:
nav-bar-dropdown
queue-list

not modules:
loading
nav-bar
footer
modals


//THOUGHTS

LOADING
while loading
	if reset
		Q logo glitching
	text say 'loading...' and dots after loading appear one after another
when loaded
	Q logo zoom in and fade out
	qView render either pg.main or pg.app
---
glitch()
	reset = false
	use animatable to create vhs-like distortions on logo
	animatable attributes are set with semi-random values
	setTimeout with random value
		reset = true



Ticket module
Work with the physicality
Shows bottom half of a "paper"-queue ticket.
Pull down and release to take a ticket.
Current status is displayed in the middle part of the ticket
Swipe left or right to discard the ticket

Queue module
Writes all the queue items in order
If account is limited
	place a "help" button in all queue items
else
	place dropdown in all queue items
