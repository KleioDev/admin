var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;
var rq = require('co-request');
var moment = require("moment");
var http = require('http');
var apn = require('apn');
var url = require('url');
var gcm = require('node-gcm');


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
        .post("/news/:id/notify", requireLogin, notifyNews);
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
        title: "News: " + news.title,
        text: news.description,
        date: moment(news.updatedAt).format(" MMM DD, YYYY hh:mm a"),
        id: news.id,
        sent: news.notified
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

    if(response.statusCode >= 200 && response.statusCode < 300){
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

    if(response.statusCode >= 200 && response.statusCode < 300){
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

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect('/news');
    }
}

function *notifyNews(){
    var response, id = this.params.id, news;

    try {
        response = yield rq({
            uri : apiUrl + '/news/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) news = JSON.parse(response.body);
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    var iosDevices = [];
    try {
        response = yield rq({
            uri : apiUrl + '/phones?os=ios',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) iosDevices = JSON.parse(response.body).phones;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    if(iosDevices) {
        var note = new apn.Notification();
        note.badge = 1;
        note.sound = "beep.wav";
        note.contentAvailable = 1;
        note.alert = "New Article! " + news.title;
        note.payload = {'messageFrom': 'MuSA', 'action':{type:"news", id:news.id}};
        var options = {
            gateway: 'gateway.sandbox.push.apple.com',
            errorCallback: function (errorNum, notification) {
                console.log('Error is: %s', errorNum);
                console.log("Note " + JSON.stringify(notification));
            },
            cert: 'PushMuSACert.pem',
            key: 'PushMuSAKey.pem',
            passphrase: 'musa',
            port: 2195,
            enhanced: true,
            cacheLength: 100
        }
        var tokens = [];
        for(var i = 0; i < iosDevices.length; i++)
            tokens.push(iosDevices[i].token);

        var apnsConnection = new apn.Connection(options);
        apnsConnection.pushNotification(note, tokens);
    }

    //Android notifications
    var androidDevices = [];
    try {
        response = yield rq({
            uri : apiUrl + '/phones?os=android',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) androidDevices = JSON.parse(response.body).phones;
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    if(androidDevices) {
        var message = new gcm.Message();
        var sender = new gcm.Sender('AIzaSyB5q4frCAMgfJIIkoLYvZeu7aIB6VJJzds');
        message.addData('message', news.title);
        message.addData('title', 'New Article at Musa!');
        message.addData('msgcnt', '3');
        message.addData('type', "news");
        message.addData('news', news.id);
        message.timeToLive = 3000;
        var tokens = [];
        for(var i = 0; i < androidDevices.length; i++)
            tokens.push(androidDevices[i].token);
        sender.send(message, tokens, 4, function (result) {
            console.log(result); //null is actually success
        });
    }

    try {
        response = yield rq({
            uri : apiUrl + '/news/' + id,
            method : 'PUT',
            json:true,
            body: {notified: true},
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

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
