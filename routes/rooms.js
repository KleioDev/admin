var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var rq = require('co-request');
var apiUrl = require("../config/config").url;



module.exports = function(){
    var roomController = new Router();
    roomController
        .get("/rooms", requireLogin, rooms)
        .get("/room/:id", requireLogin, room)
        .post("/new_room", requireLogin, new_room)
        .post("/add_to_room", requireLogin, add_to_room)
        .post("/remove_ibeacon", requireLogin, remove_ibeacon);

    return roomController.routes();
};

/**
 * Renders the Rooms page
 */
function *rooms(){
    var response,
        rooms = [];

    try {
        response = yield rq({
            uri : apiUrl + '/room',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) rooms = JSON.parse(response.body).rooms;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    //console.log(rooms);
    yield this.render("rooms",{
        title: "Rooms",
        rooms : rooms
    });
}

/**
 * Renders the Single Room page.
 * If there is no room with the id passed, render 404;
 */
function *room(){
    var room, response, id = this.params.id;

    try {
        response = yield rq({
            uri : apiUrl + '/room/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode == 404){
            this.status = 404;
            yield this.render("404", {
                title: "Wrong Room"
            });
        }
        //Parse
        room = JSON.parse(response.body);
        //console.log(room);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

        yield this.render("room", {
            title: room.name,
            room: room
        });

}

/**
 * Add a new room.
 */
function *new_room(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/room',
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
        this.redirect("/rooms/");
    }
}


/**
 * Parse the iBeacon id to add it to a room and return to the Rooms page.
 */
function *add_to_room(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/beacon',
            method : 'POST',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });

    } catch(err){
        //console.log(err);
        this.throw(err.message, err.status || 500);
    }
    //console.log(body);
    if(response.statusCode == 201){
        this.redirect("/room/" + body.RoomId);
    }
}


/**
 * Parse the iBeacon id to remove an iBeacon from the room and return to the Single Rooms page.
 */
function *remove_ibeacon(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/beacon/' + body.ibeacon_id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });

    } catch(err){
        //console.log(err);
        this.throw(err.message, err.status || 500);
    }
    //console.log(body);
    if(response.statusCode == 200){
        this.redirect("/room/" + body.RoomId);
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
