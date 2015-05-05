var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;
var rq = require('co-request');

/**
 * Exports the routes to the server router.
 * @returns {*} the controller routes
 */
module.exports = function(){
    var museumController = new Router();
    museumController
        .get("/museum", requireLogin, museum)
        .get("/edit_museum_information", requireLogin, edit_museum_information)
        .post("/edit_museum", requireLogin,
        parse_multi({
            multipart: true,
            formidable: {
                uploadDir: 'public/img/'
            }
        }),edit_museum);
    return museumController.routes();
};
/**
 * Render the Museum page.
 */
function *museum(){
    var response,
        museum;

    try {
        response = yield rq({
            uri : apiUrl + '/museum',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
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
        response = yield rq({
            uri : apiUrl + '/museum',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
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
    var body = this.request.body;
    var response;
    if(!body) {
        this.throw('Bad Request', 400);
    }
    //console.log(body.fields);
    var schedule = {monday:{},tuesday:{},wednesday:{}, thursday:{},friday:{},saturday:{},sunday:{}};
    if(body.fields.mon_op) schedule.monday.open = body.fields.mon_op;
    if(body.fields.mon_cl) schedule.monday.close = body.fields.mon_cl;
    if(body.fields.mon_closed) schedule.monday.closed = body.fields.mon_closed;

    if(body.fields.tue_op) schedule.tuesday.open = body.fields.tue_op;
    if(body.fields.tue_cl) schedule.tuesday.close = body.fields.tue_cl;
    if(body.fields.tue_closed) schedule.tuesday.closed = body.fields.tue_closed;

    if(body.fields.wed_op) schedule.wednesday.open = body.fields.wed_op;
    if(body.fields.wed_cl) schedule.wednesday.close = body.fields.wed_cl;
    if(body.fields.wed_closed) schedule.wednesday.closed = body.fields.wed_closed;

    if(body.fields.thu_op) schedule.thursday.open = body.fields.thu_op;
    if(body.fields.thu_cl) schedule.thursday.close = body.fields.thu_cl;
    if(body.fields.thu_closed) schedule.thursday.closed = body.fields.thu_closed;

    if(body.fields.fri_op) schedule.friday.open = body.fields.fri_op;
    if(body.fields.fri_cl) schedule.friday.close = body.fields.fri_cl;
    if(body.fields.fri_closed) schedule.friday.closed = body.fields.fri_closed;

    if(body.fields.sat_op) schedule.saturday.open = body.fields.sat_op;
    if(body.fields.sat_cl) schedule.saturday.close = body.fields.sat_cl;
    if(body.fields.sat_closed) schedule.saturday.closed = body.fields.sat_closed;

    if(body.fields.sun_op) schedule.sunday.open = body.fields.sun_op;
    if(body.fields.sun_cl) schedule.sunday.close = body.fields.sun_cl;
    if(body.fields.sun_closed) schedule.sunday.closed = body.fields.sun_closed;

    try {
        response = yield rq({
            uri: apiUrl + "/museum/1",
            method: "PUT",
            json: true,
            body: {
                //file: fs.createReadStream(body.files.file.path),
                name: body.fields.name,
                description: body.fields.description,
                hoursOfOperation: JSON.stringify(schedule),
                phone: body.fields.phone,
                email: body.fields.email,
                location: body.fields.location,
                terms: body.fields.terms,
                about: body.fields.about
            },
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });

    } catch(err){
        console.log(err);
        this.throw(err.message, err.status || 500);
    }


    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/museum");
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
