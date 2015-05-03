var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;
var rq = require("co-request");

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
    var response, users;

    try {
        response = yield rq({
            uri : apiUrl + '/user',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        users = JSON.parse(response.body).users;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    yield this.render("users", {
        title : "Users",
        users : users});
}

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
