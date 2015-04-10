var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');

module.exports = function(){
    var feedbackController = new Router();
    feedbackController
        .get("/feedback", requireLogin, feedback)
        .post("/solve_feedback", requireLogin, solve_feedback)
        .post("/delete_feedback", requireLogin, delete_feedback);
    return feedbackController.routes();
};

/**
  * Render Feedback page.
  */
function *feedback(){
	yield this.render("feedback", {
        title : "Feedback",
        feedback:db.feedback});
}

/**
  * Parse feedback information to mark the feedback as solved.
  */
function *solve_feedback(){
    var post = yield parse(this);
    for(var i = 0; i < db.feedback.length; i++){
        if(post.id == db.feedback[i].id){
            db.feedback[i].solved = true;
            break;
        }
    }
    this.redirect("/feedback");

}

/**
  * Parse feedback information to delete it.
  * Only feedback marked as solved may be deleted.
  */
function *delete_feedback(){
    var post = yield parse(this);
    for(var i = 0; i < db.feedback.length; i++){
        if(post.id == db.feedback[i].id){
            db.feedback.splice(i, 1);
            break;
        }
    }
    this.redirect("/feedback");
}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}