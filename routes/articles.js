var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = ' http://136.145.116.229:4567';
var rq = require('co-request');

module.exports = function(){
    var articlesController = new Router();
    articlesController
        .get("/articles", requireLogin, articles)
        .get("/article/:id", requireLogin, single_article)
        .get("/edit_article/:id", requireLogin, edit_article_page)
        .get("/new_article", requireLogin, new_article)
        .post("/edit_article", requireLogin, edit_article)
        .post("/add_article", requireLogin, add_article)
        .post("/delete_article", requireLogin, delete_article);//DELETE
    return articlesController.routes();
};

/**
 * Render the Articles page
 */
function *articles(){
    var response,
        news;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/news',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        news = JSON.parse(response.body).news;
        console.log(news);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("articles", {
        title : "Articles",
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
        console.log(news);


    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("single_article", {
        title: news.title,
        text: news.description,
        date: news.updatedAt,
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
    var post = yield parse(this);

    for(var i = 0; i < db.articles.length; i++){
        if(post.id == db.articles[i].id) {
            if(post.title.length != 0){
                db.articles[i].title = post.title;
                db.articles[i].date = new Date;
            }

            if(post.text.length != 0){
                db.articles[i].text = post.text;
                db.articles[i].date = new Date;
            }
        }
    }
    this.redirect("/articles");
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
        this.redirect('/articles');
    }

}


/**
 * Parse the article information to remove it to the database.
 */

function *delete_article(){
    var post = yield parse(this);
    for(var i = 0; i < db.articles.length; i++){
        if(post.id == db.articles[i].id){
            db.articles.splice(i, 1);
            break;
        }
    }

    this.redirect("/articles");
}


function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
