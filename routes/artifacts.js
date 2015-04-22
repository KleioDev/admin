var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');
var apiUrl = 'http://136.145.116.229:4567';
var rq = require('co-request');

module.exports = function(){
    var artifactController = new Router();
    artifactController
        .get("/artifacts", requireLogin, artifacts)
        .get("/artifact/:id", requireLogin, artifact)
        .post("/upload_audio", requireLogin, parse_multi({
            multipart: true,
            formidable: {
                uploadDir: 'public/audio/'
            }
        }), upload_audio)
        .post("/delete_audio", requireLogin, delete_audio)
        .post("/add_text", requireLogin, add_text)
        .post("/delete_text", requireLogin, delete_text)
        .post("/add_image", requireLogin,
        parse_multi({
            multipart: true,
            formidable: {
                uploadDir: 'public/img/'
            }
        }),
        add_image)
        .post("/delete_image", requireLogin, delete_image)
        .post("/add_video", requireLogin, add_video)
        .post("/delete_video", requireLogin, delete_video)
        .post("/add_exhibition", requireLogin, add_exhibition);

    return artifactController.routes();
};

/**
 * Render the Objects page.
 */
function *artifacts(){
    var response, artifacts;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/artifact',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        //console.log(response.body);
        artifacts = JSON.parse(response.body).artifacts;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }



    yield this.render("artifacts", {
        title : "Artifacts",
        objects: artifacts
    });
}

/**
 * Render the Single Object page.
 * If the id passed does not belong to an object, render 404.
 */
function *artifact(){
    var response, artifact, exhibitions, id = this.params.id;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/artifact/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        //console.log(response.body);
        artifact = JSON.parse(response.body);

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/exhibition',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        if(response.statusCode != 404) exhibitions = JSON.parse(response.body).exhibitions;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }
    yield this.render("artifact", {
        title: "Artifact: " + artifact.title,
        artifact : artifact,
        exhibitions : exhibitions
    });
}


/**
 * Parses title information and handles the audio upload.
 */
function *upload_audio(){
    var body = this.request.body, response; //this.request.body.fields
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/audio/',
            method : 'POST',
            json : true,
            body : {
                title: body.fields.title,
                description: body.fields.description,
                link: "../" + body.files.file.path,
                ArtifactId: body.fields.ArtifactId
            },
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/artifact/" + body.fields.ArtifactId);
    }
}
/**
 * Parse audio entry information to remove the entry and delete the audio file.
 */

function *delete_audio(){
    //fs.unlinkSync("views/" + body.link);
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/audible/' + body.audio_id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect("/artifact/" + body.artifact_id);
    }
}

/**
 * Parse title and text information to add it to the database.
 */
function *add_text(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/archive/',
            method : 'POST',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/artifact/" + body.ArtifactId);
    }

}

/**
 * Parse the text entry information to remove it from the object
 */
function *delete_text(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/archive/' + body.text_id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/artifact/" + body.artifact_id);
    }

}

/**
 * Parse title to create an image content entry and upload the file.
 */
function *add_image(){
    console.log(this.request.body);
    var body = this.request.body, response; //this.request.body.fields
    if(!body) {
        this.throw('Bad Request', 400);
    }
    //console.log(body.fields);
    try {
        response = yield rq({
            uri : apiUrl + '/image/',
            method : 'POST',
            json : true,
            body : {
                title: body.fields.title,
                description: body.fields.description,
                link: "../" + body.files.file.path,
                ArtifactId: body.fields.ArtifactId
            },
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/artifact/" + body.fields.ArtifactId);
    }
}

/**
 * Parse image content entry information to delete it from an object.
 */
function *delete_image(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/image/' + body.image_id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect("/artifact/" + body.artifact_id);
    }
}

/**
 * Parse video content information to add the entry from the database.
 */
function *add_video(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }
    body.link = body.link.substring(body.link.indexOf("=")+1);

    try {
        response = yield rq({
            uri : apiUrl + '/video/',
            method : 'POST',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/artifact/" + body.ArtifactId);
    }

}

/**
 * Parse video content information to delete the entry from the database.
 */
function *delete_video(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/video/' + body.text_id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect("/artifact/" + body.artifact_id);
    }
}

function *add_exhibition(){
    var body = yield parse(this), response;
    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/artifact/' + body.ArtifactId,
            method : 'PUT',
            json: true,
            body:{ExhibitionId: body.id},
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }
    //console.log(body);
    if(response.statusCode >= 200 && response.statusCode < 300){
        this.redirect("/artifact/" + body.ArtifactId);
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