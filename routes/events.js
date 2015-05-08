var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;
var rq = require('co-request');
var moment = require("moment");
var http = require('http');
var apn = require('apn');
var url = require('url');
var gcm = require('node-gcm');

/**
 * Exports the routes to the server router.
 * @returns {*} the controller routes
 */
module.exports = function(){
    var eventController = new Router();
    eventController
        .get("/events", requireLogin, events)
        .get("/event/:id", requireLogin, single_event)
        .get("/event/:id/edit", requireLogin, edit_event_page)
        .get("/new_event", requireLogin, new_event)
        .post("/event/:id/edit", requireLogin, edit_event)
        .post("/event", requireLogin, add_event)
        .post("/event/:id/delete", requireLogin, delete_event)
        .post('/event/:id/notify', requireLogin, notifyEvent);
    return eventController.routes();
};

/**
 * Render the Events page
 */
function *events(){
    var response, events;

    try {
        response = yield rq({
            uri : apiUrl + '/events',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode != 404) {
            events = JSON.parse(response.body).events;
            for (var i = 0; i < events.length; i++) {
                events[i].eventDate = moment(events[i].eventDate).format(" MMM DD, YYYY hh:mm a");
            }
        }

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("events", {
        title : "Events",
        events: events});
}


/**
 * Render the Single event page.
 * If the id passed does not belong to an event, render 404.
 */
function *single_event(){// id as param
    var response, id = this.params.id, event;

    try {
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        event = JSON.parse(response.body);

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("event", {
        title: "Event: " + event.title,
        text: event.description,
        date: moment(event.updatedAt).format(" MMM DD, YYYY hh:mm a"),
        eventDate: moment(event.eventDate).format(" MMM DD, YYYY hh:mm a"),
        id: event.id,
        sent: event.notified
    });


}


/**
 * Render the Edit event page.
 * If the id passed does not belong to an event, render 404.
 */
function *edit_event_page(){ //id as param
    var response, id = this.params.id, event;

    try {
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        event = JSON.parse(response.body);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    yield this.render("edit_event", {
        title: event.title,
        text: event.description,
        eventDate : moment(event.eventDate).format(" MMM DD, YYYY hh:mm a"),
        id: event.id
    });


}

/**
 * Parse event information to edit the it.
 */
function *edit_event(){
    var body = yield parse(this);
    var id = body.id;
    var response;
    if(!body) {
        this.throw('Bad Request', 400);
    }
    for(prop in body){
        if(!body[prop]) delete body[prop];
    }
    if(body.date && body.time) {
        //body.eventDate = body.date+"T"+body.time+":00.000-04";
        body.eventDate = moment(body.date+"T"+body.time+":00.000-04");
    }
    else if(body.date && !body.time) {
        body.eventDate = moment(body.date+"T");
    }

    //2015-05-06T08:00:00.000-04
    //2015-05-02T03:24:00.000Z

    console.log(body);
    try {
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'PUT',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect('/events');
    }
}

/**
 * Render the New event page.
 */

function *new_event(){
    yield this.render("new_event", {
        title: "New Event"
    });
}


/**
 * Parse the event information to add it to the database.
 */

function *add_event(){
    var body = yield parse(this);
    //body.image = null;
    var response;
    if(!body) {
        this.throw('Bad Request', 400);
    }
    var date = body.date+"T"+body.time+":00.000-04";
    body.eventDate = new moment(date);

    delete body.date;
    delete body.time;



    try {
        response = yield rq({
            uri : apiUrl + '/events',
            method : 'POST',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect('/events');
    }

}


/**
 * Parse the event information to remove it to the database.
 */

function *delete_event(){
    var body = yield parse(this);
    var id = body.id;
    var response;

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect('/events');
    }
}

/**
 * Sends notification to phones stored in the database.
 */
function *notifyEvent(){
    var response, id = this.params.id, event;

    try {
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) event = JSON.parse(response.body);
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    var iosDevices = [];
    try {
        response = yield rq({
            uri : apiUrl + '/phones?os=ios',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404)  iosDevices = JSON.parse(response.body).phones;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    if(iosDevices) {
        var note = new apn.Notification();
        note.badge = 1;
        note.sound = "beep.wav";
        note.contentAvailable = 1;
        note.alert = "New Event! " + event.title;
        note.payload = {'messageFrom': 'MuSA', 'action':{type:"event", id:event.id}};
        var options = {
            gateway: 'gateway.sandbox.push.apple.com',
            errorCallback: function (errorNum, notification) {
                console.log('Error is: %s', errorNum);
                console.log("Note " + JSON.stringify(notification));
            },
            cert: 'PushMuSACert.pem',
            key: 'PushMuSAKey.pem',
            passphrase: 'musa',
            port: 2195,
            enhanced: true,
            cacheLength: 100
        }
        var tokens = [];
        for(var i = 0; i < iosDevices.length; i++)
            tokens.push(iosDevices[i].token);

        var apnsConnection = new apn.Connection(options);
        apnsConnection.pushNotification(note, tokens);
    }

    //Android notifications
    var androidDevices = [];
    try {
        response = yield rq({
            uri : apiUrl + '/phones?os=android',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) androidDevices = JSON.parse(response.body).phones;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    if(androidDevices) {
        var message = new gcm.Message();
        var sender = new gcm.Sender('AIzaSyB5q4frCAMgfJIIkoLYvZeu7aIB6VJJzds');
        message.addData('message', event.title);
        message.addData('title', 'New Event at Musa!');
        message.addData('msgcnt', '3');
        message.addData('type', "event");
        message.addData('alert', event.title);
        message.addData('event', event.id);
        message.timeToLive = 3000;
        var tokens = [];
        for(var i = 0; i < androidDevices.length; i++)
            tokens.push(androidDevices[i].token);
        sender.send(message, tokens, 4, function (result) {
            console.log(result); //null is actually success
        });
    }
    try {
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'PUT',
            json:true,
            body:{notified:true},
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    this.redirect("/event/" + id);

}

/**
 * Checks if the user is logged in when accessing a page
 * @param next
 */
function *requireLogin(next){

    if (!this.session.confirm){
        this.redirect("/change");
    }
    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
