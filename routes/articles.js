var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');

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
    yield this.render("articles", {
        title : "Articles",
        articles:db.articles});
}


/**
 * Render the Single Article page.
 * If the id passed does not belong to an article, render 404.
 */
function *single_article(){// id as param
    var param_article;
    var set = false;
    for(var i = 0; i < db.articles.length; i++){
        if(this.params.id == db.articles[i].id){
            param_article = db.articles[i];
            set = true;
            break;
        }
    }

    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Article"
        });
    }
    else{
        yield this.render("single_article", {
            title: param_article.title,
            text: param_article.text,
            date: param_article.date,
            id: param_article.id
        });
    }

}


/**
 * Render the Edit Article page.
 * If the id passed does not belong to an article, render 404.
 */
function *edit_article_page(){ //id as param
    var param_article;
    var set = false;

    for(var i = 0; i < db.articles.length; i++){
        if(this.params.id == db.articles[i].id) {
            param_article = db.articles[i];
            set = true;
            break;
        }
    }
    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Article"
        });
    }
    else{
        yield this.render("edit_article", {
            title: param_article.title,
            text: param_article.text,
            date: param_article.date,
            id: param_article.id
        });
    }

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
    var post = yield parse(this);
    post.date = new Date;
    var max = db.articles[0].id;
    for(var i = 0; i<db.articles.length; i++){
        if(db.articles[i].id > max) max = db.articles[i].id;
    }
    post.id = max + 1;
    db.articles.push(post);
    this.redirect("/articles");


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
