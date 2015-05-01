var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = require("../config/config").url;
var rq = require('co-request');



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
    var body = this.request.body;
    var response;
    if(!body) {
        this.throw('Bad Request', 400);
    }


    var schedule = {monday:{},tuesday:{},wednesday:{}, thursday:{},friday:{},saturday:{},sunday:{}};
    if(body.mon_op) schedule.monday.open = body.mon_op;
    if(body.mon_cl) schedule.monday.close = body.mon_cl;
    if(body.mon_closed) schedule.monday.closed = body.mon_closed;

    if(body.tue_op) schedule.tuesday.open = body.tue_op;
    if(body.tue_cl) schedule.tuesday.close = body.tue_cl;
    if(body.tue_closed) schedule.tuesday.closed = body.tue_closed;

    if(body.wed_op) schedule.wednesday.open = body.wed_op;
    if(body.wed_cl) schedule.wednesday.close = body.wed_cl;
    if(body.wed_closed) schedule.wednesday.closed = body.wed_closed;

    if(body.thu_op) schedule.thursday.open = body.thu_op;
    if(body.thu_cl) schedule.thursday.close = body.thu_cl;
    if(body.thu_closed) schedule.thursday.closed = body.thu_closed;

    if(body.fri_op) schedule.friday.open = body.fri_op;
    if(body.fri_cl) schedule.friday.close = body.fri_cl;
    if(body.fri_closed) schedule.friday.closed = body.fri_closed;

    if(body.sat_op) schedule.saturday.open = body.sat_op;
    if(body.sat_cl) schedule.saturday.close = body.sat_cl;
    if(body.sat_closed) schedule.saturday.closed = body.sat_closed;

    if(body.sun_op) schedule.sunday.open = body.sun_op;
    if(body.sun_cl) schedule.sunday.close = body.sun_cl;
    if(body.sun_closed) schedule.sunday.closed = body.sun_closed;


    //console.log(body);
    if(!body) {
        this.throw('Bad Request', 400);
    }
    try {
        response = yield rq({
            uri: apiUrl + "/museum/1",
            method: "PUT",
            formData: {
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
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/museum");
    }

}

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
