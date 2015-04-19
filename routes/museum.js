var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = 'http://136.145.116.229:4567';
var rq = require('co-request');



module.exports = function(){
    var museumController = new Router();
    museumController
        .get("/museum", requireLogin, museum)
        .get("/edit_museum_information", requireLogin, parse_multi({
            multipart: true,
            formidable: {
                uploadDir: 'public/img/'
            }
        }), edit_museum_information)
        .post("/edit_museum", requireLogin, edit_museum);
    return museumController.routes();
};
/**
 * Render the Museum page.
 */
function *museum(){
    var response,
        museum;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/museum',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        museum = JSON.parse(response.body);

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("museum_information", {
        title : "Museum",
        museum : museum
    });
}

/**
 * Render the Edit Museum Information page.
 */
function *edit_museum_information(){
    var response,
        museum;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/museum',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        museum = JSON.parse(response.body);

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    yield this.render("edit_museum_information", {
        title : "Museum",
        museum : museum
    });
}

/**
 * Parse the information, then place it in the database.
 * User may have filled out some fields, so if the field is empty it
 * doesn't change it.
 */
function *edit_museum(){
    var body = this.request.body, response; //this.request.body.fields
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/museum/',
            method : 'POST',
            json : true,
            body : body.fields,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect("/museum");
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
