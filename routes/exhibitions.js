var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');


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
    yield this.render("exhibitions", {
        title : "Exhibitions",
        exhibitions: db.exhibitions
    });
}

/**
 * Render the Single Exhibition Page.
 * If there is no exhibition with the id passed, render 404;
 */
function *exhibition(){
    var exhibition;
    var set = false;
    for(var i = 0; i < db.exhibitions.length; i++){
        if(this.params.id == db.exhibitions[i].id){
            exhibition = db.exhibitions[i];
            set = true;
            break;
        }
    }
    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Exhibition"
        });
    }
    else{
        var list = [];
        for(var i = 0; i < exhibition.object_list.length; i++){
            for(var k = 0; k < db.objects.length; k++){
                if(typeof db.objects[k] != 'undefined' && exhibition.object_list[i] == db.objects[k].id){
                    list.push(db.objects[k]);
                }
            }
        }
        yield this.render("exhibition",{
            title: exhibition.title,
            description: exhibition.description,
            object_list: list,
            ibeacon:exhibition.ibeacon,
            id: exhibition.id
        });
    }
}


/**
 * Parses the information for creating a new Exhibition.
 */
function *new_exhibition(){
    var post = yield parse(this);
    post.object_list = [];
    var max = db.exhibitions[0].id;
    for(var i = 0; i < db.exhibitions.length; i++){//find the next highest for id
        if(db.exhibitions[i].id > max) max = db.exhibitions[i].id;
    }
    post.id = max + 1;
    db.exhibitions.push(post);
    this.redirect("/exhibitions");
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