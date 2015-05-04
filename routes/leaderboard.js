var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');
var login = require("./login");
var rq = require('co-request');
var apiUrl = require("../config/config").url;

/**
 * Exports the routes to the server router.
 * @returns {*} the controller routes
 */
module.exports = function(){
    var leaderboardController = new Router();
    leaderboardController
        .get("/leaderboard", requireLogin, leaderboard)
        .post("/reset_score/:id", requireLogin, reset_score)
        .post("/reset_leaderboard", requireLogin, reset_leaderboard);
    return leaderboardController.routes();
};

/**
 * Render the Leaderboards page.
 * This user information is specific to the leaderboards.
 */
function *leaderboard(){
    var response, leaderboard;
    try{
        response = yield rq({
            uri : apiUrl + '/leaderboard',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        leaderboard = JSON.parse(response.body).leaderboard;

    } catch(err){
        this.throw(err.message, err.status || 500);
    }
    yield this.render("leaderboard", {
        title : "Leaderboard",
        users : leaderboard
    });
}


/**
 * Parse user information to reset their score to 0
 */
function *reset_score(){
    var id = this.params.id;
    var response;

    try {
        response = yield rq({
            uri : apiUrl + '/user/' + id,
            method : 'PUT',
            json : true,
            body : {points: 0},//{active : false, points: 0},
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
    var response;
    try {
        response = yield rq({
            uri : apiUrl + '/leaderboard',
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
