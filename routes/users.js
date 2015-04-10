var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');

module.exports = function(){
    var userController = new Router();
    userController
        .get("/users", requireLogin, users);

    return userController.routes();
};

/**
 * Render the Users page.
 */
function *users(){
    yield this.render("users", {
        title : "Users",
        users : db.users});
}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
