var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var fs = require("fs");
var Router = require('koa-router');


module.exports = function(){
    var notificationController = new Router();
    notificationController
        //.get("/notifications", requireLogin, notifications)
        .post("/create_notification", requireLogin, create_notification)
        //.post("/delete_notification", requireLogin, delete_notification);//DELETE
    return notificationController.routes();
};
/**
 * Render the Notifications page.
*/
function *notifications(){
    yield this.render("notifications", {
        title : "Notifications",
        notifications:db.notifications});
}

/**
 * Parse the notification information to add it to the database.
 */
function *create_notification(){
    var post = yield parse(this);
    post.date = new Date;
    var max = db.notifications[0].id;
    for(var i = 0; i<db.notifications.length; i++){
        if(db.notifications[i].id > max) max = db.notifications[i].id;
    }
    post.id = max + 1;
    db.notifications.push(post);
    this.redirect("/notifications");

}

/**
 * Parse the notification information to remove it to the database.
 */
function *delete_notification(){
    var post = yield parse(this);
    for(var i = 0; i < db.notifications.length; i++){
        if(post.id == db.notifications[i].id){
            db.notifications.splice(i, 1);
            break;
        }
    }
    this.redirect("/notifications");

}

function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}