var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;
var rq = require('co-request');

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
    var response,
        feedback;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/feedback',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        //console.log(response.body);
        feedback = JSON.parse(response.body).feedbacks;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
	yield this.render("feedback", {
        title : "Feedback",
        feedback: feedback});
}

/**
  * Parse feedback information to mark the feedback as solved.
  */
function *solve_feedback(){
    var body = yield parse(this);
    var id = body.id;
    var response;
    //console.log(body);

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/feedback/' + id,
            method : 'PUT',
            json : true,
            body : {seen:true},
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }
    //console.log(response);
    this.redirect('/feedback');

}

/**
  * Parse feedback information to delete it.
  * Only feedback marked as solved may be deleted.
  */
function *delete_feedback(){
    var body = yield parse(this);
    var id = body.id;
    var response;
    //console.log(body);

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/feedback/' + id,
            method : 'PUT',
            json : true,
            body : {resolved:true},
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }
    //console.log(response);
    this.redirect('/feedback');
}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}