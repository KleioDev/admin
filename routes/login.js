var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');

module.exports = function(){
    var loginController = new Router();
    loginController
        .post("/login", login)
        .get("/login", login_page)
        .get("/logout", logout)
        .get("/", requireLogin, index);
    return loginController.routes();
};

/**
 * Render the Home page (root).
 */
function *index(){
    yield this.render("index", {title : "Home"});
}

/**
 * Parses the information, verifies that the user exists and matches the password.
 * If the user is matched, redirect to root.
 * If not, redirect to /login.
 */
function *login(){
    var post = yield parse(this);
    var found = false;
    for(var i = 0; i < db.users.length; i++){
        if(post.email === db.users[i].email && db.users[i].isAdmin){
            if (post.password === db.users[i].password) {
                this.session.user = db.users[i];
                this.redirect("/");
                found = true;
                break;
            }
            else {

                this.redirect("/login");
                break;
            }
        }
    }
    if(!found) this.redirect("/login");
}

/**
 * Render the login page.
 */
function *login_page(){
    yield this.render("login");
}

/**
 * Resets the session and redirects to the login page
 */
function *logout() {
    console.log(this.session.user);
    this.session = null;
    this.redirect("login");
}

/**
 * Makes the application require login throughout the whole app.
 */
function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}



exports.requireLogin = function(){
    return requireLogin;
};