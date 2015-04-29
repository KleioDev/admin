var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var rq = require('co-request');
var apiUrl = require("../config/config").url;


module.exports = function(){
    var exhibitionController = new Router();
    exhibitionController
        .get("/exhibitions", requireLogin, exhibitions)
        .get("/exhibition/:id", requireLogin, exhibition)
        .post("/new_exhibition", requireLogin, new_exhibition)
        .post("/add_to_exhibition", requireLogin, add_to_exhibition)
        .post("/remove_from_exhibition", requireLogin, remove_from_exhibition);

    return exhibitionController.routes();
};

/**
 * Render the Exhibition page
 */
function *exhibitions(){
    var response,
        exhibitions = [];

    try {
        response = yield rq({
            uri : apiUrl + '/exhibition',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) exhibitions = JSON.parse(response.body).exhibitions;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("exhibitions", {
        title : "Exhibitions",
        exhibitions: exhibitions
    });
}

/**
 * Render the Single Exhibition Page.
 * If there is no exhibition with the id passed, render 404;
 */
function *exhibition(){
    var exhibition, beacon_list, response;
    var id = this.params.id;

    try {
        response = yield rq({
            uri : apiUrl + '/exhibition/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode == 404){
            this.status = 404;
            yield this.render("404", {
                title: "Wrong Exhibition"
            });
        }
        //Parse
        exhibition = JSON.parse(response.body);
        //console.log(exhibition);
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/beacon',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode != 404) beacon_list = JSON.parse(response.body).beacons;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("exhibition",{
        title: exhibition.title,
        description: exhibition.description,
        object_list: exhibition.Artifacts,
        Beacons:exhibition.Beacons,
        beacon_list:beacon_list,
        id: exhibition.id
    });

}


/**
 * Parses the information for creating a new Exhibition.
 */
function *new_exhibition(){
    var body =  yield parse(this),
        response;

    if(!body) {
        this.throw('Bad Request', 400);
    }
    body.MuseumId = 1;
    try {
        response = yield rq({
            uri : apiUrl + '/exhibition/',
            method : 'POST',
            json : true,
            body : body,
            headers : { Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/exhibitions');
    }
}


/**
 * Parses the information for adding an iBeacon to an exhibition.
 */
function *add_to_exhibition(){
    var body =  yield parse(this), response;
    console.log(body);
    if(!body) {
        this.throw('Bad Request', 400);
    }
    try {
        response = yield rq({
            uri : apiUrl + '/exhibition/beacon',
            method : 'POST',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 201){
        this.redirect('/exhibition/' + body.ExhibitionId);
    }
}

/**
 * Parses the object id to remove an object from an exhibition.
 */
function *remove_from_exhibition(){
    var body =  yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }
    try {
        response = yield rq({
            uri : apiUrl + '/exhibition/beacon/' + body.BeaconId,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}

        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/exhibition/' + body.ExhibitionId);
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
