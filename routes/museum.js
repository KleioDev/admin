var db = require("../js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");

/**
 * Render the Museum page.
 */
exports.museum = function(){
    function *museum(){
        yield this.render("museum_information", {
            title : "Museum",
            name : db.museum_info.name,
            hours : db.museum_info.hours,
            description : db.museum_info.description
        });
    }
    return museum;
};

/**
 * Render the Edit Museum Information page.
 */
exports.edit_museum_information = function(){
    function *edit_museum_information(){
        yield this.render("edit_museum_information", {
            title : "Museum",
            name : db.museum_info.name,
            hours : db.museum_info.hours,
            description : db.museum_info.description
        });
    }

    return edit_museum_information;
}

/**
 * Parse the information, then place it in the database.
 * User may have filled out some fields, so if the field is empty it
 * doesn't change it.
 */
exports.edit_museum = function(){
    function *edit_museum(){
        var post = yield parse(this);
        console.log(post.name);

        if(post.name.length != 0)
            db.museum_info.name = post.name;

        if(post.hours.length != 0)
            db.museum_info.hours = post.hours;

        if(post.description.length != 0)
            db.museum_info.description = post.description;

        this.redirect("/museum");

    }
    return edit_museum;
}