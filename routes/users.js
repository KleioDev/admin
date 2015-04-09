var db = require("./db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");


/**
 * Render the Users page.
 */
exports.users = function(){
    function *users(){
        yield this.render("users", {
            title : "Users",
            users : db.users});
    }

    return users;
};