// Load the dependencies
var koa = require("koa");
var logger = require("koa-logger");
var views = require("koa-views");
var Router = require("koa-router");
var serve = require("koa-static-folder");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var parse_multi = require("koa-better-body");
var route = new Router();
var fs = require("fs");
var session = require("koa-session");

/**
 * Require the dummy database
 * @type {exports} lists containing dummy information
 */
var db = require("./js/db");

//Start the app
var app = koa();


//Authentication
app.keys = ['secret'];
app.use(session(app));

/**
 * Anonymous function:
 * When logged in, delete the password from the session
 * for security purposes.
 */
app.use(function *(next) {
    if (this.session && this.session.user) {
        for(var i = 0; i < db.users.length; i++){
            if(this.session.email === db.users[i].email){//Find the user
                this.request.user = db.users[i];
                delete this.request.user.password; // delete the password from the session
                this.session.user = db.users[i];  //refresh the session value
                this.response.locals.user = db.users[i];
            }
        }
        yield next;
    }
    else {
        yield next;
    }
});

/**
 * handlebars()
 * Set up the templating engine and helper functions
 */
app.use(handlebars({
    defaultLayout: "main",
    partialsDir : "./views",
    helpers:
        {
            /**
             * Strips a string to provide a sample string
             * @param obj The complete string
             * @returns {string} A string consisting of the first 80, or less, characters
             */
            sample: function(obj) {
                return obj.substring(0, 80) + "...";
            },
            /**
             * Prints out information about the current object
             * @param obj The current object
             */
            debug: function(obj){
                console.log("Working.");
                console.log(obj);
            },
            /**
             * Lists users in the leaderboard view. Add a counter for rankings.
             * String will be sorted once integrated with the database.
             * @returns {string} html source for a list of users
             */
            list_user: function(){
                var string = "";
                for(var i = 0; i < db.table.users.length; i++){
                    string += "<tr>" + "<td>" + (i+1) + "</td>";
                    string += "<td>" + db.table.users[i].name + "</td>";
                    string += "<td>" + db.table.users[i].score + "</td>";
                    string += "<td style=\"text-align:center;\"><form action=\"/reset_score\" method=\"post\"><input hidden=\"true\" value=\"" +
                        db.table.users[i].id +
                        "\" name=\"id\"><button type=\"submit\" class=\"btn btn-danger\"><i class=\"fa fa-trash-o fa-fw\"></i></button></form></td></tr>";
                    }
                return string;
            }
        }
    }));

/**
 * Set the logger
 */
app.use(logger());

/**
 * Serve components for the web page
 */
app.use(serve("./js"));
app.use(serve("./dist"));
app.use(serve("./bower_components"));
app.use(serve("./img"));
app.use(serve("./audio"));

/**
 * Route specification
 */

/**
 * Login routes
 */
route.post("/login", login);
route.get("/login", login_page);
route.get("/logout", function*() {
    console.log(this.session.user);
    this.session = null;
    this.redirect("login");
});
/**
 * Museum routes
 */
route.get("/", requireLogin, index);
route.get("/museum", requireLogin, museum);
route.get("/edit_museum_information", requireLogin, edit_museum_information);
route.post("/edit_museum", requireLogin, edit_museum);

/**
 * Exhibitions routes
 */
route.get("/exhibitions", requireLogin, exhibitions);
route.get("/exhibition/:id", requireLogin, exhibition);
route.post("/new_exhibition", requireLogin, new_exhibition);
route.post("/add_to_exhibition", requireLogin, add_to_exhibition);
route.post("/remove_from_exhibition", requireLogin, remove_from_exhibition);//DELETE

/**
 * Object routes
 */
route.get("/objects", requireLogin, objects);
route.get("/single_object/:id", requireLogin, single_object);
route.post("/upload_audio", requireLogin, parse_multi({
    multipart: true,
    formidable: {
        uploadDir: 'audio/'
    }
}), upload_audio);
route.post("/delete_audio", requireLogin, delete_audio);//DELETE
route.post("/add_text", requireLogin, add_text);
route.post("/delete_text", requireLogin, delete_text);//DELETE
route.post("/add_image", requireLogin, parse_multi({
    multipart: true,
    formidable: {
        uploadDir: 'img/'
    }
}), add_image);
route.post("/delete_image", requireLogin, delete_image);//DELETE
route.post("/add_video", requireLogin, add_video);
route.post("/delete_video", requireLogin, delete_video);//DELETE

/**
 * Article routes
 */
route.get("/articles", requireLogin, articles);
route.get("/article/:id", requireLogin, single_article);
route.get("/edit_article/:id", requireLogin, edit_article_page);
route.get("/new_article", requireLogin, new_article);
route.post("/edit_article", requireLogin, edit_article);
route.post("/add_article", requireLogin, add_article);
route.post("/delete_article", requireLogin, delete_article);//DELETE

/**
 * Notification routes
 */
route.get("/notifications", requireLogin, notifications);
route.post("/create_notification", requireLogin, create_notification);
route.post("/delete_notification", requireLogin, delete_notification);//DELETE

/**
 * User routes
 */
route.get("/users", requireLogin, users);

/**
 * Leaderboard routes
 */
route.get("/leaderboard", requireLogin, leaderboard);
route.post("/reset_score", requireLogin, reset_score);
route.post("/reset_leaderboard", requireLogin, reset_leaderboard);

/**
 * Administrator routes
 */
route.get("/administrators", requireLogin, administrators);
route.get("/new_admin", requireLogin, new_admin);
route.get("/edit_admin/:id", requireLogin, edit_admin_page);
route.post("/edit_admin", requireLogin, edit_admin);
route.post("/add_admin", requireLogin, add_admin);

/**
 * Feedback Routes
 */
route.get("/feedback", requireLogin, feedback);
route.post("/solve_feedback", requireLogin, solve_feedback);//UPDATE
route.post("/delete_feedback", requireLogin, delete_feedback);//DELETE

/**
 * Room routes
 */
route.get("/rooms", requireLogin, rooms);
route.get("/room/:id", requireLogin, room);
route.post("/new_room", requireLogin, new_room);
route.post("/add_to_room", requireLogin, add_to_room);
route.post("/remove_ibeacon", requireLogin, remove_ibeacon);//DELETE

/**
 * Miscellaneous
 */
route.get("/database", requireLogin, database);

//Set the routes
app.use(route.routes());

/******************************************************************************
 * Route Definitions
 */


/******************************************************************************
 * Museum route definitions
 */

/**
 * Parses the information, verifies that the user exists and matches the password.
 * If the user is matched, redirect to root.
 * If not, redirect to /login.
 */
function *login(){
    var post = yield parse(this);
    var found = false;
    for(var i = 0; i < db.users.length; i++){
        if(post.email === db.users[i].email && db.users[i].isAdmin){
            if (post.password === db.users[i].password) {
                this.session.user = db.users[i];
                this.redirect("/");
                found = true;
                break;
            }
            else {

                this.redirect("/login");
                break;
            }
        }
    }
    if(!found) this.redirect("/login");
}

/**
 * Render the login page.
 */
function *login_page(){
    yield this.render("login");

}

/**
 * Render the Home page (root).
 */
function *index(){
    yield this.render("index", {title : "Home"});
}

/**
 * Render the Museum page.
 */
function *museum(){
	yield this.render("museum_information", {
        title : "Museum",
        name : db.museum_info.name,
        hours : db.museum_info.hours,
        description : db.museum_info.description
        });
}

/**
 * Render the Edit Museum Information page.
 */
function *edit_museum_information(){
    yield this.render("edit_museum_information", {
        title : "Museum",
        name : db.museum_info.name,
        hours : db.museum_info.hours,
        description : db.museum_info.description
    });
}

/**
 * Parse the information, then place it in the database.
 * User may have filled out some fields, so if the field is empty it
 * doesn't change it.
 */
function *edit_museum(){
    var post = yield parse(this);
    console.log(post.name);
    
    if(post.name.length != 0)
        db.museum_info.name = post.name;

    if(post.hours.length != 0)
        db.museum_info.hours = post.hours;

    if(post.description.length != 0)
        db.museum_info.description = post.description;
    
    this.redirect("/museum");

}

/******************************************************************************
 * Exhibition route definitions
 */

/**
 * Render the Exhibition page
 */
function *exhibitions(){
	yield this.render("exhibitions", {
        title : "Exhibitions",
        exhibitions: db.exhibitions
    });
}

/**
 * Render the Single Exhibition Page.
 * If there is no exhibition with the id passed, render 404;
 */
function *exhibition(){
    var exhibition;
    var set = false;
    for(var i = 0; i < db.exhibitions.length; i++){
        if(this.params.id == db.exhibitions[i].id){
            exhibition = db.exhibitions[i];
            set = true;
            break;
        }
    }
    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Exhibition"
        });
    }


    else{
        var list = [];
        for(var i = 0; i < exhibition.object_list.length; i++){
            for(var k = 0; k < db.objects.length; k++){
                if(typeof db.objects[k] != 'undefined' && exhibition.object_list[i] == db.objects[k].id){
                    list.push(db.objects[k]);
                }
            }
        }
        yield this.render("exhibition",{
            title: exhibition.title,
            description: exhibition.description,
            object_list: list,
            ibeacon:exhibition.ibeacon,
            id: exhibition.id
        });
    }

}

/**
 * Parses the information for creating a new Exhibition.
 */
function *new_exhibition(){
    var post = yield parse(this);
    post.object_list = [];
    var max = db.exhibitions[0].id;
    for(var i = 0; i < db.exhibitions.length; i++){//find the next highest for id
        if(db.exhibitions[i].id > max) max = db.exhibitions[i].id;
    }
    post.id = max + 1;
    db.exhibitions.push(post);
    this.redirect("/exhibitions");
}

/**
 * Parses the information for adding an object to an exhibition,
 * or updating the iBeacon associated with the exhibition.
 */
function *add_to_exhibition(){
    var post = yield parse(this);
    var present = false;
    var exhibition_index;
    for(var i = 0; i < db.exhibitions.length; i++){//find the position of the exhibition
        if(post.id == db.exhibitions[i].id) {
            exhibition_index = i;
            break;
        }
    }
    if(post.ibeacon.length != 0) db.exhibitions[exhibition_index].ibeacon = post.ibeacon;
    if(isNaN(post.object) || post.object.length == 0){
        this.redirect("/exhibition/" + post.id);
    }
    else{
        for(var i = 0; i < db.exhibitions[exhibition_index].object_list.length; i++){//check if its already in the list
            if(post.object == db.exhibitions[exhibition_index].object_list[i]) {
                present = true;
                break;
            }
        }
        if(!present) db.exhibitions[exhibition_index].object_list.push(parseInt(post.object)); //if not, add it
        console.log(db.exhibitions[exhibition_index].object_list);
        this.redirect("/exhibition/" + post.id);
    }
}

/**
 * Parses the object id to remove an object from an exhibition.
 */
function *remove_from_exhibition(){
    var post = yield parse(this);
    var exhibition_index;
    for(var i = 0; i < db.exhibitions.length; i++){//find the position of the exhibition
        if(post.exhibition_id == db.exhibitions[i].id) {
            exhibition_index = i;
            break;
        }
    }
    for(var i = 0; i < db.exhibitions[exhibition_index].object_list.length; i++){//check if its already in the list
        if(post.object_id == db.exhibitions[exhibition_index].object_list[i]) {
            db.exhibitions[exhibition_index].object_list.splice(i, 1);
            break;
        }
    }
    console.log(db.exhibitions[exhibition_index].object_list);

    this.redirect("/exhibition/" + post.exhibition_id);
}

/******************************************************************************
 * Room route definitions
 */

/**
 * Renders the Rooms page
 */
function *rooms(){
    yield this.render("rooms",{
        title: "Rooms",
        rooms : db.rooms
    });
}

/**
 * Renders the Single Room page.
 * If there is no room with the id passed, render 404;
 */
function *room(){
    var room;
    var set = false;
    for(var i = 0; i < db.rooms.length; i++){
        if(this.params.id == db.rooms[i].id){
            room = db.rooms[i];
            set = true;
            break;
        }
    }
    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Room"
        });
    }
    else{
        yield this.render("room", {
            title: "Room " + room.number,
            id: room.id,
            ibeacon_list: room.current_id
        });
    }

}

/**
 * Add a new room.
 */
function *new_room(){
    db.rooms.push({
        id: db.rooms.length + 1,
        number: db.rooms.length + 1,
        current_id: []
    });
    this.redirect("/rooms");

}

/**
 * Parse the iBeacon id to add it to a room and return to the Rooms page.
 */
function *add_to_room(){
    var post = yield parse(this);
    var present = false;
    var room_index;
    for(var i = 0; i < db.rooms.length; i++){//find the position of the exhibition
        if(post.room_id == db.rooms[i].id) {
            room_index = i;
            break;
        }
    }

    for(var i = 0; i < db.rooms[room_index].current_id.length; i++){//check if its already in the list
        if(post.ibeacon_id == db.rooms[room_index].current_id[i]) {
            present = true;
            break;
        }
    }
    if(!present) db.rooms[room_index].current_id.push({id:post.ibeacon_id}); //if not, add it
    this.redirect("/room/" + post.room_id);


}

/**
 * Parse the iBeacon id to remove an iBeacon from the room and return to the Single Rooms page.
 */
function *remove_ibeacon(){
    var post = yield parse(this);
    var room_index;
    for(var i = 0; i < db.rooms.length; i++){//find the position of the exhibition
        if(post.room_id == db.rooms[i].id) {
            room_index = i;
            break;
        }
    }
    for(var i = 0; i < db.rooms[room_index].current_id.length; i++){//check if its already in the list
        if(post.ibeacon_id == db.rooms[room_index].current_id[i].id) {
            db.rooms[room_index].current_id.splice(i, 1);
            break;
        }
    }
    this.redirect("/room/" + post.room_id);
}


/******************************************************************************
 * Object route definitions
 */

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
    for(id = 0; id < db.objects.length; i++){//get the index
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
    for(id = 0; id < db.objects.length; i++){//get the index
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
    for(id = 0; id < db.objects.length; i++){//get the index
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
    for(id = 0; id < db.objects.length; i++){//get the index
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
    for(id = 0; id < db.objects.length; i++){//get the index
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
    for(id = 0; id < db.objects.length; i++){//get the index
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



/******************************************************************************
 * Article route definitions
 */

/**
 * Render the Articles page
 */ 
function *articles(){
	yield this.render("articles", {
        title : "Articles",
        articles:db.articles});
}

/**
 * Render the Single Article page.
 * If the id passed does not belong to an article, render 404.
 */
function *single_article(){// id as param
    var param_article;
    var set = false;
    for(var i = 0; i < db.articles.length; i++){
        if(this.params.id == db.articles[i].id){
            param_article = db.articles[i];
            set = true;
            break;
        }
    }

    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Article"
        });
    }
    else{
        yield this.render("single_article", {
            title: param_article.title,
            text: param_article.text,
            date: param_article.date,
            id: param_article.id
        });
    }

}

/**
 * Render the Edit Article page.
 * If the id passed does not belong to an article, render 404.
 */
function *edit_article_page(){ //id as param
    var param_article;
    var set = false;

    for(var i = 0; i < db.articles.length; i++){
        if(this.params.id == db.articles[i].id) {
            param_article = db.articles[i];
            set = true;
            break;
        }
    }
    if(!set){
        this.status = 404;
        yield this.render("404", {
            title: "Wrong Article"
        });
    }
    else{
        yield this.render("edit_article", {
            title: param_article.title,
            text: param_article.text,
            date: param_article.date,
            id: param_article.id
        });
    }

}

/**
 * Parse article information to edit the it.
 * Since the user may not fill out all the fields, update it as needed.
 */
function *edit_article(){
    var post = yield parse(this);

    for(var i = 0; i < db.articles.length; i++){
        if(post.id == db.articles[i].id) {
            if(post.title.length != 0){
                db.articles[i].title = post.title;
                db.articles[i].date = new Date;
            }

            if(post.text.length != 0){
                db.articles[i].text = post.text;
                db.articles[i].date = new Date;
            }
        }
    }
    this.redirect("/articles");
}

/**
 * Render the New Article page.
 */
function *new_article(){
    yield this.render("new_article", {
        title: "New Article"
    });
}

/**
 * Parse the article information to add it to the database.
 */
function *add_article(){
    var post = yield parse(this);
    post.date = new Date;
    var max = db.articles[0].id;
    for(var i = 0; i<db.articles.length; i++){
        if(db.articles[i].id > max) max = db.articles[i].id;
    }
    post.id = max + 1;
    db.articles.push(post);
    this.redirect("/articles");


}

/**
 * Parse the article information to remove it to the database.
 */
function *delete_article(){
    var post = yield parse(this);
    for(var i = 0; i < db.articles.length; i++){
        if(post.id == db.articles[i].id){
            db.articles.splice(i, 1);
            break;
        }
    }

    this.redirect("/articles");
}

/******************************************************************************
 * Article route definitions
 */

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


/******************************************************************************
 * User route definitions
 */

/**
 * Render the Users page.
 */
function *users(){
	yield this.render("users", {
        title : "Users",
        users : db.users});
}

/******************************************************************************
 * Leaderboard route definitions
 */

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

/******************************************************************************
 * Administrator route definitions
 */

/**
 * Render the Administrators page.
 */
function *administrators(){
	yield this.render("administrators", {
        title : "Administrators",
        admins : db.users});
}

/**
 * Render the New Administrator page.
 */
function *new_admin(){
    yield this.render("new_admin",{
        title: "New Administrator"
    });
}

/**
 * Render the Edit Administrator page.
 * If the id passed belongs to a user that is not an admin or a user
 * at all, render 404.
 */
function *edit_admin_page(){

    var param_admin;
    var set = false;
    for(var i = 0; i < db.users.length; i++){
        if(this.params.id == db.users[i].id){
            param_admin = db.users[i];
            set = true;
            break;
        }
    }
    if(set && param_admin.isAdmin) {
        yield this.render("edit_admin", {
            title: "Edit Administrator",
            admin: param_admin
        });
    }
    else{
        this.status = 404;
        yield this.render("404", {
            title: "Wrong User"
        });
    }
}

/**
 * Parse the user information to update information given.
 */
function *edit_admin(){
    var post = yield parse(this);
    console.log(post);
    for(var i = 0; i<db.users.length; i++){
        if(db.users[i].id == post.id) {
            if(post.admin_first.length != 0)
                db.users[i].first_name = post.admin_first;

            if(post.admin_last.length != 0)
                db.users[i].last_name = post.admin_last;

            if(post.admin_email.length != 0)
                db.users[i].email = post.admin_email;

            break;
        }
    }
    this.redirect("/administrators");
}

/**
 * Parse the user information to create a new admin (user).
 * Admins may be separated from users during integration.
 */
function *add_admin(){
    var post = yield parse(this);
    var max = db.users[0].id;
    for(var i = 0; i<db.users.length; i++){
        if(db.users[i].id > max) max = db.users[i].id;
    }
    post.id = max + 1;

    db.users.push({
        id: post.id,
        email:post.email,
        first_name:post.first_name,
        last_name:post.last_name,
        gender:post.gender,
        age:post.age,
        banned:false,
        isAdmin:true
    });
    this.redirect("/administrators");
}

/******************************************************************************
 * Feedback route definitions
 */

/**
  * Render Feedback page.
  */
function *feedback(){
	yield this.render("feedback", {
        title : "Feedback",
        feedback:db.feedback});
}

/**
  * Parse feedback information to mark the feedback as solved.
  */
function *solve_feedback(){
    var post = yield parse(this);
    for(var i = 0; i < db.feedback.length; i++){
        if(post.id == db.feedback[i].id){
            db.feedback[i].solved = true;
            break;
        }
    }
    this.redirect("/feedback");

}

/**
  * Parse feedback information to delete it.
  * Only feedback marked as solved may be deleted.
  */
function *delete_feedback(){
    var post = yield parse(this);
    for(var i = 0; i < db.feedback.length; i++){
        if(post.id == db.feedback[i].id){
            db.feedback.splice(i, 1);
            break;
        }
    }
    this.redirect("/feedback");
}

/******************************************************************************
 * Administrator route definitions
 */

 /**
  * Not implemented yet.
  */
function *database(){
	yield this.render("database", {title : "Database"});
}

/**
 * Makes the application require login throughout the whole app.
 */
function *requireLogin(next){

    if (!this.session.user) {
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}

//Set the app to listen at the port
app.listen(3000);
console.log("Listening on port 3000");

//Export the app for testing purposes
exports.app = app;