var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = ' http://136.145.116.229:4567';
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
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/user',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        users = JSON.parse(response.body).users;
        //console.log(users);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    yield this.render("users", {
        title : "Users",
        users : users});
}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
