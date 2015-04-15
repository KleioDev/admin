var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var login = require("./login");
var rq = require('co-request');
var apiUrl = 'http://136.145.116.229:4567';



module.exports = function(){
    var leaderboardController = new Router();
    leaderboardController
        .get("/leaderboard", requireLogin, leaderboard)
        .post("/reset_score", requireLogin, reset_score)
        .post("/reset_leaderboard", requireLogin, reset_leaderboard);
    return leaderboardController.routes();
};

/**
 * Render the Leaderboards page.
 * This user information is specific to the leaderboards.
 */
function *leaderboard(){
    console.log(this.session.user);
    var response, leaderboard;
    try{
        response = yield rq({
            uri : apiUrl + '/leaderboard',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //console.log(response.body);
        leaderboard = JSON.parse(response.body).leaderboard;

    } catch(err){
        this.throw(err.message, err.status || 500);
    }
    console.log(leaderboard);
    yield this.render("leaderboard", {
        title : "Leaderboard",
        users : leaderboard
    });
}


/**
 * Parse user information to reset their score to 0
 */
function *reset_score(){
    var body = yield parse(this);
    var response;
    var id = body.id;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/user/' + id,
            method : 'PUT',
            json : true,
            body : {points : 0},
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/leaderboard');
    }
}

/**
 * Reset all users' score to 0.
 */
function *reset_leaderboard(){
    var body = yield parse(this);
    var response;

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/leaderboard/reset',
            method : 'PUT',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/leaderboard');
    }
}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}
