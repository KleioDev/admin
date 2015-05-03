var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var rq = require('co-request');
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;


module.exports = function(){
    var loginController = new Router();
    loginController
        .post("/login", login)
        .get("/login", login_page)
        .get("/logout", logout)
        .get("/", requireLogin, index)
        .get("/forgot", forgot)
        .get("/change", change)
        .get("/change/notify", change_notify)
        .post("/forgot", reset_password);
    return loginController.routes();
};

/**
 * Render the Home page (root).
 */
function *index(){
    var response, artifacts;
    try {
        response = yield rq({
            uri : apiUrl + '/artifact', //"artifact/top"
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        artifacts = JSON.parse(response.body).artifacts;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for(var i = 0; i < artifacts.length; i++){
        artifacts[i].interactions = i;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(artifacts);
    yield this.render("index", {
        title : "Home",
        artifacts : artifacts
    });
}

/**
 * Parses the information, verifies that the user exists and matches the password.
 * If the user is matched, redirect to root.
 * If not, redirect to /login.
 */
function *login(){
    var post = yield parse(this);
    try {
        response = yield rq({
            uri : apiUrl + '/authenticate',
            method : 'POST',
            json : true,
            body : post
        });
        if(response.statusCode >= 400){
            this.redirect("/login");
        }
        else{
            this.session.user = response.body.token;
            this.session.confirm = response.body.confirm;
            this.session.id = response.body.id;
            this.redirect("/");
        }
    } catch(err) {
        this.throw(err.message, err.status || 500);
        this.redirect("/login");
    }
}

/**
 * Render the login page.
 */
function *login_page(){
    yield this.render("login", {title:"Login"});
}

/**
 * Resets the session and redirects to the login page
 */
function *logout() {
    this.session = null;
    this.redirect("login");
}

function *forgot(){
    yield this.render("forgot", {title:"Password Reset"});

}

function *change(){
    yield this.render("change_password",{id:this.session.id});
}


function *reset_password(){

    //Update admin account with random password
    var body = yield parse(this), response;
    try {
        response = yield rq({
            uri : apiUrl + '/administrator/reset',
            method : 'POST',
            json : true,
            body : body
            });
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200) {
        this.redirect("/change/notify");
    }
}

function *change_notify(){
    yield this.render("change_notify", {title:"Password Reset"});
}

/**
 * Makes the application require login throughout the whole app.
 */
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
