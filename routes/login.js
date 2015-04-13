var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var rq = require('co-request');
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
apiUrl = ' http://136.145.116.229:4567';


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
    console.log(post);
    try {
        response = yield rq.post(apiUrl + '/authenticate', {form:{
            email:post.email,
            password:post.password
        }});

        if(response.statusCode == 401){
            this.redirect("/login");
        }
        else{
            console.log(response.body);
            this.session.user = response.body;
            this.redirect("/");
        }
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
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
    console.log(this.session.user);
    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
