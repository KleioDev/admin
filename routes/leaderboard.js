var db = require("./db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");


/**
 * Render the Leaderboards page.
 * This user information is specific to the leaderboards.
 */
function *leaderboard(){
    //console.log(db.table.users);
    yield this.render("leaderboard", {
        title : "Leaderboard",
        users : db.table.users});
}
exports.leaderboard = function(){

}

/**
 * Parse user information to reset their score to 0
 */
function *reset_score(){
    var post = yield parse(this);
    for(var i = 0; i < db.table.users.length; i++){
        if(post.id == db.table.users[i].id) db.table.users[i].score = 0;
    }
    this.redirect("/leaderboard");


}

/**
 * Reset all users' score to 0.
 */
function *reset_leaderboard(){
    for(var i = 0; i < db.table.users.length; i++){
        db.table.users[i].score = 0;
    }
    this.redirect("/leaderboard");
}