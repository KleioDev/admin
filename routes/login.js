var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var rq = require('co-request');
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;

/**
 * Exports the routes to the server router.
 * @returns {*} the controller routes
 */
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
        .post("/forgot", reset_password)
        .get("/qr", qr_catalog)
        .get("/404", not_found);
    return loginController.routes();
};

/**
 * Render the Home page (root).
 */
function *index(){
    var response, artifacts, ios, android, phones, users = [{period: '2015-01', active: 0, interactive: 0}], array = [];

    //Top artifacts
    try {
        response = yield rq({
            uri : apiUrl + '/artifact?top=true', //"artifact?top=true"
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode != 404) artifacts = JSON.parse(response.body).artifacts;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    //IOS downloads
    try {
        response = yield rq({
            uri : apiUrl + '/phones?os=ios',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode != 404) ios = JSON.parse(response.body).phones.length;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    try {
        response = yield rq({
            uri : apiUrl + '/phones?os=android',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode != 404) android = JSON.parse(response.body).phones.length;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/active/user',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        if(response.statusCode != 404) users = JSON.parse(response.body);
        for(prop in users){
            array.push(users[prop]);
        }
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }


    yield this.render("index", {
        title : "Home",
        artifacts : artifacts,
        phones:{ios: ios, android: android},
        users: array
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

/**
 * Renders the forgot password page
 */
function *forgot(){
    yield this.render("forgot", {title:"Password Reset"});

}

/**
 * Renders the reset password page
 */
function *change(){

    yield this.render("change_password",{id:this.session.id});
}

/**
 * Handles the password reset
 */
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

/**
 * Renders a page telling the user his password has been changed.
 */
function *change_notify(){
    yield this.render("change_notify", {title:"Password Reset"});
}

function *qr_catalog(){
    var response, artifacts;
    try {
        response = yield rq({
            uri : apiUrl + '/artifact?per_page=1000',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        artifacts = JSON.parse(response.body).artifacts;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    yield this.render("qr", {title: "QR Catalog",artifacts: artifacts});
}

function *not_found(){
    yield this.render("404",{title: "404: Not Found"})
}

/**
 * Checks if the user is logged in when accessing a page
 * @param next
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
