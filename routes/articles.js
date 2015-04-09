var db = require("./db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");

/**
 * Render the Articles page
 */
exports.articles = function(){
    function *articles(){
        yield this.render("articles", {
            title : "Articles",
            articles:db.articles});
    }
    return articles;
};


/**
 * Render the Single Article page.
 * If the id passed does not belong to an article, render 404.
 */
exports.single_article = function(){
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
    return single_article;
};


/**
 * Render the Edit Article page.
 * If the id passed does not belong to an article, render 404.
 */
exports.edit_article_page = function(){
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
    return edit_article_page;
};

/**
 * Parse article information to edit the it.
 * Since the user may not fill out all the fields, update it as needed.
 */
exports.edit_article = function(){
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
    return edit_article;
};


/**
 * Render the New Article page.
 */

exports.new_article = function(){
    function *new_article(){
        yield this.render("new_article", {
            title: "New Article"
        });
    }
    return new_article;
};


/**
 * Parse the article information to add it to the database.
 */

exports.add_article = function(){
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
    return add_article;
};


/**
 * Parse the article information to remove it to the database.
 */

exports.delete_article = function(){
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
    return delete_article;
};

