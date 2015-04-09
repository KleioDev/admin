var db = require("../js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");


/**
 * Render the Leaderboards page.
 * This user information is specific to the leaderboards.
 */

exports.leaderboard = function(){
    function *leaderboard(){
        //console.log(db.table.users);
        yield this.render("leaderboard", {
            title : "Leaderboard",
            users : db.table.users});
    }
    return leaderboard;
};

/**
 * Parse user information to reset their score to 0
 */

exports.reset_score = function(){
    function *reset_score(){
        var post = yield parse(this);
        for(var i = 0; i < db.table.users.length; i++){
            if(post.id == db.table.users[i].id) db.table.users[i].score = 0;
        }
        this.redirect("/leaderboard");


    }
    return reset_score;
};

/**
 * Reset all users' score to 0.
 */
exports.reset_leaderboard = function(){
    function *reset_leaderboard(){
        for(var i = 0; i < db.table.users.length; i++){
            db.table.users[i].score = 0;
        }
        this.redirect("/leaderboard");
    }
    return reset_leaderboard;
};