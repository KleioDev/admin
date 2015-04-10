var db = require("../public/js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");
var Router = require('koa-router');


module.exports = function(){
    var objectController = new Router();
    objectController
        .get("/objects", requireLogin, objects)
        .get("/single_object/:id", requireLogin, single_object)
        .post("/upload_audio", requireLogin, parse_multi({
            multipart: true,
            formidable: {
                uploadDir: 'audio/'
            }
        }), upload_audio)
        .post("/delete_audio", requireLogin, delete_audio)
        .post("/add_text", requireLogin, add_text)
        .post("/delete_text", requireLogin, delete_text)
        .post("/add_image", requireLogin, parse_multi({
            multipart: true,
            formidable: {
                uploadDir: 'img/'
            }
        }), add_image)
        .post("/delete_image", requireLogin, delete_image)
        .post("/add_video", requireLogin, add_video)
        .post("/delete_video", requireLogin, delete_video);

    return objectController.routes();
};

/**
 * Render the Objects page.
 */
function *objects(){
    yield this.render("objects", {
        title : "Objects",
        objects: db.objects
    });
}

/**
 * Render the Single Object page.
 * If the id passed does not belong to an object, render 404.
 */
function *single_object(){
    var object;
    var set = false;

    for(var i = 0; i < db.objects.length; i++){
        if(db.objects[i].id == this.params.id){
            object = db.objects[i];
            set = true;
            break;
        }
    }
    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Object"
        });
    }
    else{
        yield this.render("single_object", {
            title: object.title,
            object : object
        });
    }

}


/**
 * Parses title information and handles the audio upload.
 */
    function *upload_audio(){
        console.log(this.request.body);
        var id;
        for(id = 0; id < db.objects.length; id++){//get the index
            if(this.request.body.fields.object_id == db.objects[id].id) break;
        }

        var max = db.objects[id].audio_content[0].id;
        for(var i = 0; i<db.objects[id].audio_content.length; i++){
            if(db.objects[id].audio_content[i].id > max) max = db.objects[id].audio_content[i].id;
        }
        db.objects[id].audio_content.push({
            id: max + 1,
            title: this.request.body.fields.title,
            audio: "../" + this.request.body.files.file.path
        });

        console.log(db.objects[id].audio_content);

        this.redirect("/single_object/" + this.request.body.fields.object_id);
    }
/**
 * Parse audio entry information to remove the entry and delete the audio file.
 */

function *delete_audio(){
    var post = yield parse(this);
    var id;
    for(id = 0; id < db.objects.length; id++){//get the index
        if(post.object_id == db.objects[id].id) break;
    }

    for(var i = 0; i<db.objects[id].audio_content.length; i++){
        if(db.objects[id].audio_content[i].id == post.audio_id){
            fs.unlinkSync("views/" + db.objects[id].audio_content[i].audio);
            db.objects[id].audio_content.splice(i, 1);
            break;
        }
    }
    this.redirect("/single_object/"+post.object_id);
}

/**
 * Parse the text entry information to remove it from the object
 */
function *delete_text(){
    var post = yield parse(this);
    var id;
    for(id = 0; id < db.objects.length; id++){//get the index
        if(post.object_id == db.objects[id].id) break;
    }

    for(var i = 0; i<db.objects[id].text_content.length; i++){
        if(db.objects[id].text_content[i].id == post.text_id){
            db.objects[id].text_content.splice(i, 1);
            break;
        }
    }
    this.redirect("/single_object/"+post.object_id);

}

/**
 * Parse title and text information to add it to the database.
 */
function *add_text(){
    var post = yield parse(this);
    var id;
    for(id = 0; id < db.objects.length; id++){//get the index
        if(post.object_id == db.objects[id].id) break;
    }
    var max = db.objects[id].text_content[0].id;

    for(var i = 0; i<db.objects[id].text_content.length; i++){
        if(db.objects[id].text_content[i].id > max) max = db.objects[id].text_content[i].id;
    }

    db.objects[id].text_content.push({
        id: max + 1,
        title: post.title,
        text: post.text
    });

    this.redirect("/single_object/" + post.object_id);
}


/**
 * Parse image content entry information to delete it from an object.
 */
function *delete_image(){
    var post = yield parse(this);
    var id;
    for(id = 0; id < db.objects.length; id++){//get the index
        if(post.object_id == db.objects[id].id) break;
    }

    for(var i = 0; i<db.objects[id].image_content.length; i++){
        if(db.objects[id].image_content[i].id == post.image_id){
            fs.unlinkSync("views/" + db.objects[id].image_content[i].image_path);
            db.objects[id].image_content.splice(i, 1);
            break;
        }
    }
    this.redirect("/single_object/"+post.object_id);
}

/**
 * Parse title to create an image content entry and upload the file.
 */
function *add_image(){
    console.log(this.request.body);
    var id;
    for(id = 0; id < db.objects.length; id++){//get the index
        if(this.request.body.fields.object_id == db.objects[id].id) break;
    }

    var max = db.objects[id].image_content[0].id;
    for(var i = 0; i<db.objects[id].image_content.length; i++){
        if(db.objects[id].image_content[i].id > max) max = db.objects[id].image_content[i].id;
    }
    db.objects[id].image_content.push({
        id: max + 1,
        title: this.request.body.fields.title,
        image_path: "../" + this.request.body.files.file.path
    });

    console.log(db.objects[id].image_content);

    this.redirect("/single_object/" + this.request.body.fields.object_id);
}

/**
 * Parse video content information to delete the entry from the database.
 */
function *delete_video(){
    var post = yield parse(this);
    var id;
    for(id = 0; id < db.objects.length; id++){//get the index
        if(post.object_id == db.objects[id].id) break;
    }

    for(var i = 0; i<db.objects[id].video_content.length; i++){
        if(db.objects[id].video_content[i].id == post.video_id){
            db.objects[id].video_content.splice(i, 1);
            break;
        }
    }
    this.redirect("/single_object/"+post.object_id);
}

/**
 * Parse video content information to add the entry from the database.
 */
function *add_video(){
    var post = yield parse(this);
    var id;
    for(id = 0; id < db.objects.length; id++){//get the index
        if(post.object_id == db.objects[id].id) break;
    }
    var max = db.objects[id].video_content[0].id;

    for(var i = 0; i<db.objects[id].video_content.length; i++){
        if(db.objects[id].video_content[i].id > max) max = db.objects[id].video_content[i].id;
    }

    db.objects[id].video_content.push({
        id: max + 1,
        title: post.title,
        youtube_url: post.text,
        embed_id: post.text.substring(post.text.indexOf("=")+1)
    });
    console.log(db.objects[id].video_content);
    this.redirect("/single_object/" + post.object_id);

}


function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}