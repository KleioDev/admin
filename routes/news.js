var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = ' http://136.145.116.229:4567';
var rq = require('co-request');
var moment = require("moment");
var http = require('http');
var apn = require('apn');
var url = require('url');

module.exports = function(){
    var newsController = new Router();
    newsController
        .get("/news", requireLogin, news)
        .get("/news/:id", requireLogin, single_article)
        .get("/edit_article/:id", requireLogin, edit_article_page)
        .get("/new_article", requireLogin, new_article)
        .post("/edit_article", requireLogin, edit_article)
        .post("/add_article", requireLogin, add_article)
        .post("/delete_article", requireLogin, delete_article)
        .post("/news/:id/notify", requireLogin, notify);
    return newsController.routes();
};

/**
 * Render the News page
 */
function *news(){
    var response,
        news;

    try {
        response = yield rq({
            uri : apiUrl + '/news',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        news = JSON.parse(response.body).news;
        for(var i = 0; i < news.length; i++){
            news[i].updatedAt = moment(news[0].updatedAt).format(" MMM DD, YYYY hh:mm a");
        }

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("news", {
        title : "News",
        articles: news});
}


/**
 * Render the Single Article page.
 * If the id passed does not belong to an article, render 404.
 */
function *single_article(){// id as param
    var response, id = this.params.id, news;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/news/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        news = JSON.parse(response.body);
        //console.log(news);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("single_article", {
        title: news.title,
        text: news.description,
        date: moment(news.updatedAt).format(" MMM DD, YYYY hh:mm a"),
        id: news.id
    });


}


/**
 * Render the Edit Article page.
 * If the id passed does not belong to an article, render 404.
 */
function *edit_article_page(){ //id as param
    var response, id = this.params.id, news;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/news/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        news = JSON.parse(response.body);
        console.log(news);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    yield this.render("edit_article", {
        title: news.title,
        text: news.description,
        id: news.id
    });


}

/**
 * Parse article information to edit the it.
 * Since the user may not fill out all the fields, update it as needed.
 */
function *edit_article(){
    var body = yield parse(this);
    var id = body.id;
    var response;

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/news/' + id,
            method : 'PUT',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/news');
    }
}

/**
 * Render the New Article page.
 */

function *new_article(){
    yield this.render("new_article", {
        title: "New Article"
    });
}


/**
 * Parse the article information to add it to the database.
 */

function *add_article(){
    var body = yield parse(this);
    body.image = null;
    var response;
    console.log(this.session.user);
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/news',
            method : 'POST',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/news');
    }

}


/**
 * Parse the article information to remove it to the database.
 */

function *delete_article(){
    var body = yield parse(this);
    var id = body.id;
    var response;

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/news/' + id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/news');
    }
}

function *notify(){
    var response, id = this.params.id, news;

    try {
        response = yield rq({
            uri : apiUrl + '/news/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        news = JSON.parse(response.body);
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }


    var iphone = "ac84931e1113520ded04aa0f64dbb5abe99bad27b23141925c65c34719ef6087";
    var device = new apn.Device(iphone);

    var note = new apn.Notification();
    note.badge = 1;
    note.sound = "beep.wav";
    note.contentAvailable = 1;
    note.alert = "News!" + news.title;
    note.payload = {'messageFrom': 'MuSA'};
    note.device = device;

    var callback = function(errorNum, notification){
        console.log('Error is: %s', errorNum);
        console.log("Note " + JSON.stringify(notification));
    }
    var options = {
        gateway: 'gateway.sandbox.push.apple.com',
        errorCallback: callback,
        cert: 'PushMuSACert.pem',
        key:  'PushMuSAKey.pem',
        passphrase: 'musa',
        port: 2195,
        enhanced: true,
        cacheLength: 100
    }
    var apnsConnection = new apn.Connection(options);
    console.log("Note " + JSON.stringify(note));
    apnsConnection.sendNotification(note);

    this.redirect("/news/" + id);

}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
