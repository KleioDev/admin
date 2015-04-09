var db = require("./db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");


/**
 * Render the Notifications page.
 */
exports.notifications = function(){
    function *notifications(){
        yield this.render("notifications", {
            title : "Notifications",
            notifications:db.notifications});
    }
    return notifications;
};

/**
 * Parse the notification information to add it to the database.
 */
exports.create_notification = function(){
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
    return create_notification;
};

/**
 * Parse the notification information to remove it to the database.
 */
exports.delete_notification = function(){
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
    return delete_notification;
};
