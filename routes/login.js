var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var rq = require('co-request');
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
apiUrl = 'http://136.145.116.229:4567';
var Email = require("email").Email;


module.exports = function(){
    var loginController = new Router();
    loginController
        .post("/login", login)
        .get("/login", login_page)
        .get("/logout", logout)
        .get("/", requireLogin, index)
        .get("/forgot", forgot)
        .post("/forgot", reset_password);
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
    //console.log(post);
    try {
        response = yield rq({
            uri : apiUrl + '/authenticate',
            method : 'POST',
            json : true,
            body : post
        });

        if(response.statusCode == 401 || response.statusCode == 500){
            this.redirect("/login");
        }
        else{
            //console.log(response.body);
            this.session.user = response.body;
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
    yield this.render("login");
}

/**
 * Resets the session and redirects to the login page
 */
function *logout() {
    //console.log(this.session.user);
    this.session = null;
    this.redirect("login");
}

function *forgot(){
    yield this.render("forgot");

}

function *reset_password(){

    //Update admin account with random password
    var body = yield parse(this), response, admin, password = makeid();
    try {
        response = yield rq({
            uri : apiUrl + '/administrator?email=' + body.email,
            method : 'GET',
            json : true,
            body : body
        });
        admin = JSON.parse(response.body).administrators;
        console.log(admin);
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    var id = admin.id;
    try {
        response = yield rq({
            uri : apiUrl + '/administrator/' + id,
            method : 'PUT',
            json : true,
            body : {password:password}
        });
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    if(response.statusCode == 200) {
        //send email with updated pw
        var message = new Email({
            from: "kleio.team@gmail.com",
            to: admin.email,
            subject: "Password Recovery",
            body: "Your temporary password is: " + password + ".Please access " + apiUrl + " and change your password in the administrator page."
        });
        message.send();
        //admin can then enter with that one
        this.redirect("/login");
    }
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

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
