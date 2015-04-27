var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = ' http://136.145.116.229:4567';
var rq = require('co-request');
var moment = require("moment");
var http = require('http');
var apn = require('apn');
var url = require('url');

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
        .post('/event/:id/notify', requireLogin, notify);
    return eventController.routes();
};

/**
 * Render the Events page
 */
function *events(){
    var response, events;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/events',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        events = JSON.parse(response.body).events;
        //console.log(events);


        for(var i = 0; i < events.length; i++){
            //console.log(events[i].eventDate);
            events[i].eventDate = moment(events[i].eventDate).format(" MMM DD, YYYY hh:mm a");
        }
        //console.log(moment(events[0].eventDate).format("YYYY-MM-DD HH:mm"));

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    console.log(events);
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
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        event = JSON.parse(response.body);
        //console.log(event);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("event", {
        title: event.title,
        text: event.description,
        date: moment(event.updatedAt).format(" MMM DD, YYYY hh:mm a"),
        eventDate: moment(event.eventDate).format(" MMM DD, YYYY hh:mm a"),
        id: event.id
    });


}


/**
 * Render the Edit event page.
 * If the id passed does not belong to an event, render 404.
 */
function *edit_event_page(){ //id as param
    var response, id = this.params.id, event;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        event = JSON.parse(response.body);
        //console.log(event);


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
    console.log(body);
    body.eventDate = body.date+"T"+body.time+":00.000-04";
    delete body.date, body.time;
    console.log(body);
    if(!body) {
        this.throw('Bad Request', 400);
    }
    //2015-05-06T08:00:00.000-04
    //2015-05-02T03:24:00.000Z


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
    var date = body.date+"T"+body.time+":00.000-04";
    console.log(date);
    body.eventDate = new moment(date);

    delete body.date;
    delete body.time;
    console.log(body.eventDate);

    //console.log(this.session.user);
    if(!body) {
        this.throw('Bad Request', 400);
    }

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

function *notify(){
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


    var iphone = "ac84931e1113520ded04aa0f64dbb5abe99bad27b23141925c65c34719ef6087";
    var device = new apn.Device(iphone);

    var note = new apn.Notification();
    note.badge = 1;
    note.sound = "beep.wav";
    note.contentAvailable = 1;
    note.alert = "New Event! " + event.title;
    note.payload = {'messageFrom': 'MuSA'};
    note.device = device;

    var callback = function(errorNum, notification){
        console.log('Error is: %s', errorNum);
        console.log("Note " + JSON.stringify(notification));
    }
    var options = {
        gateway: 'gateway.sandbox.push.apple.com',
        errorCallback: callback,
        cert: 'PushMuSACert.pem',
        key:  'PushMuSAKey.pem',
        passphrase: 'musa',
        port: 2195,
        enhanced: true,
        cacheLength: 100
    }
    var apnsConnection = new apn.Connection(options);
    console.log("Note " + JSON.stringify(note));
    apnsConnection.sendNotification(note);

    this.redirect("/event/" + id);

}


function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
