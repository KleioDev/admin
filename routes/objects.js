var db = require("../js/db");
var koa = require("koa");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var fs = require("fs");


/**
 * Render the Objects page.
 */
exports.objects = function(){
    function *objects(){
        yield this.render("objects", {
            title : "Objects",
            objects: db.objects
        });
    }
    return objects;
};

/**
 * Render the Single Object page.
 * If the id passed does not belong to an object, render 404.
 */
exports.single_object = function(){
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
    return single_object;
};


/**
 * Parses title information and handles the audio upload.
 */
exports.upload_audio = function(){
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
    return upload_audio;
};

/**
 * Parse audio entry information to remove the entry and delete the audio file.
 */

exports.delete_audio = function(){
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
    return delete_audio;
};

/**
 * Parse the text entry information to remove it from the object
 */
exports.delete_text = function(){
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
    return delete_text;
};

/**
 * Parse title and text information to add it to the database.
 */
exports.add_text = function(){
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

    return add_text;
};

/**
 * Parse image content entry information to delete it from an object.
 */
exports.delete_image = function(){
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
    return delete_image;
};

/**
 * Parse title to create an image content entry and upload the file.
 */
exports.add_image = function(){
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
    return add_image;
};


/**
 * Parse video content information to delete the entry from the database.
 */
exports.delete_video = function(){
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

    return delete_video;
};

/**
 * Parse video content information to add the entry from the database.
 */
exports.add_video = function(){
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
    return add_video;
};
