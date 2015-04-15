var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = ' http://136.145.116.229:4567';
var rq = require('co-request');

module.exports = function(){
    var eventController = new Router();
    eventController
        .get("/events", requireLogin, events)
        .get("/event/:id", requireLogin, single_event)
        .get("/event/:id/edit", requireLogin, edit_event_page)
        .get("/new_event", requireLogin, new_event)
        .post("/event/:id/edit", requireLogin, edit_event)
        .post("/event", requireLogin, add_event)
        .post("/event/:id/delete", requireLogin, delete_event);//DELETE
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
        console.log(events);


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
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/events/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        event = JSON.parse(response.body);
        console.log(event);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("event", {
        title: event.title,
        text: event.description,
        date: event.updatedAt,
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
        console.log(event);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    yield this.render("edit_event", {
        title: event.title,
        text: event.description,
        id: event.id
    });


}

/**
 * Parse event information to edit the it.
 * Since the user may not fill out all the fields, update it as needed.
 */
function *edit_event(){
    var body = yield parse(this);
    var id = body.id;
    var response;

    if(!body) {
        this.throw('Bad Request', 400);
    }

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

    if(response.statusCode == 200){
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
    body.image = null;
    var response;
    console.log(this.session.user);
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

    if(response.statusCode == 200){
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

    if(response.statusCode == 200){
        this.redirect('/events');
    }
}


function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
