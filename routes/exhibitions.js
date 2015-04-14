var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var rq = require('co-request');
var apiUrl = ' http://136.145.116.229:4567';



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
        //console.log(this.session.user);
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
    console.log(exhibitions);

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
    var exhibition;
    var response;
    var id = this.params.id;

    try {
        //console.log(this.session.user);
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
        console.log(exhibition);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }


    yield this.render("exhibition",{
        title: exhibition.title,
        description: exhibition.description,
        object_list: [],
        ibeacon:[],
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
    console.log(body);
    try {
        response = yield rq({
            uri : apiUrl + '/exhibition/',
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
        this.redirect('/exhibitions');
    }
}


/**
 * Parses the information for adding an object to an exhibition,
 * or updating the iBeacon associated with the exhibition.
 */
function *add_to_exhibition(){
    var post = yield parse(this);
    var present = false;
    var exhibition_index;
    for(var i = 0; i < db.exhibitions.length; i++){//find the position of the exhibition
        if(post.id == db.exhibitions[i].id) {
            exhibition_index = i;
            break;
        }
    }
    if(post.ibeacon.length != 0) db.exhibitions[exhibition_index].ibeacon = post.ibeacon;
    if(isNaN(post.object) || post.object.length == 0){
        this.redirect("/exhibition/" + post.id);
    }
    else{
        for(var i = 0; i < db.exhibitions[exhibition_index].object_list.length; i++){//check if its already in the list
            if(post.object == db.exhibitions[exhibition_index].object_list[i]) {
                present = true;
                break;
            }
        }
        if(!present) db.exhibitions[exhibition_index].object_list.push(parseInt(post.object)); //if not, add it
        console.log(db.exhibitions[exhibition_index].object_list);
        this.redirect("/exhibition/" + post.id);
    }
}

/**
 * Parses the object id to remove an object from an exhibition.
 */
function *remove_from_exhibition(){
    var post = yield parse(this);
    var exhibition_index;
    for(var i = 0; i < db.exhibitions.length; i++){//find the position of the exhibition
        if(post.exhibition_id == db.exhibitions[i].id) {
            exhibition_index = i;
            break;
        }
    }
    for(var i = 0; i < db.exhibitions[exhibition_index].object_list.length; i++){//check if its already in the list
        if(post.object_id == db.exhibitions[exhibition_index].object_list[i]) {
            db.exhibitions[exhibition_index].object_list.splice(i, 1);
            break;
        }
    }
    console.log(db.exhibitions[exhibition_index].object_list);

    this.redirect("/exhibition/" + post.exhibition_id);
}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
