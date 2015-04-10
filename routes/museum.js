var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');



module.exports = function(){
    var museumController = new Router();
    museumController
        .get("/museum", requireLogin, museum)
        .get("/edit_museum_information", requireLogin, edit_museum_information)
        .post("/edit_museum", requireLogin, edit_museum);
    return museumController.routes();
};
/**
 * Render the Museum page.
 */
function *museum(){
    yield this.render("museum_information", {
        title : "Museum",
        name : db.museum_info.name,
        hours : db.museum_info.hours,
        description : db.museum_info.description
    });
}

/**
 * Render the Edit Museum Information page.
 */
function *edit_museum_information(){
    yield this.render("edit_museum_information", {
        title : "Museum",
        name : db.museum_info.name,
        hours : db.museum_info.hours,
        description : db.museum_info.description
    });
}

/**
 * Parse the information, then place it in the database.
 * User may have filled out some fields, so if the field is empty it
 * doesn't change it.
 */
function *edit_museum(){
    var post = yield parse(this);

    if(post.name.length != 0)
        db.museum_info.name = post.name;

    if(post.hours.length != 0)
        db.museum_info.hours = post.hours;

    if(post.description.length != 0)
        db.museum_info.description = post.description;

    this.redirect("/museum");

}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
