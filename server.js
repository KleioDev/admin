//Dependencies
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

//Dummy database
var db = require("./js/db");

//Start the app
var app = koa();


//Authentication
app.keys = ['secret'];
app.use(session(app));

app.use(function *(next) {
    if (this.session && this.session.user) {
        for(var i = 0; i < db.users.length; i++){
            if(this.session.email === db.users[i].email){//Find the
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



//Set up the templating engine and helper functions
app.use(handlebars({
    defaultLayout: "main",
    partialsDir : "./views",
    helpers:
        {
            sample: function(obj) {
                return obj.substring(0, 80) + "...";
            },
            debug: function(obj){
                console.log("Working.");
                console.log(obj);
            },
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

//Set the logger
app.use(logger());

//Serve components for the web page
app.use(serve("./js"));
app.use(serve("./dist"));
app.use(serve("./bower_components"));
app.use(serve("./img"));
app.use(serve("./audio"));

////////
//ROUTES
////////
route.post("/login", login);
route.get("/login", login_page);

route.get("/logout", function*() {
    console.log(this.session.user);
    this.session = null;
    this.redirect("login");
});
//Museum Routes
route.get("/", requireLogin, index);
route.get("/museum", requireLogin, museum);
route.get("/edit_museum_information", requireLogin, edit_museum_information);
route.post("/edit_museum", requireLogin, edit_museum);

//Exhibition Routes
route.get("/exhibitions", requireLogin, exhibitions);
route.get("/exhibition/:id", requireLogin, exhibition);
route.post("/new_exhibition", requireLogin, new_exhibition);
route.post("/add_to_exhibition", requireLogin, add_to_exhibition);
route.post("/remove_from_exhibition", requireLogin, remove_from_exhibition);//DELETE

//Object Routes
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

//Article Routes
route.get("/articles", requireLogin, articles);
route.get("/article/:id", requireLogin, single_article);
route.get("/edit_article/:id", requireLogin, edit_article_page);
route.get("/new_article", requireLogin, new_article);
route.post("/edit_article", requireLogin, edit_article);
route.post("/add_article", requireLogin, add_article);
route.post("/delete_article", requireLogin, delete_article);//DELETE

//Notification Routes
route.get("/notifications", requireLogin, notifications);
route.post("/create_notification", requireLogin, create_notification);
route.post("/delete_notification", requireLogin, delete_notification);//DELETE

//User Routes
route.get("/users", requireLogin, users);

//Leaderboard Routes
route.get("/leaderboard", requireLogin, leaderboard);
route.post("/reset_score", requireLogin, reset_score);
route.post("/reset_leaderboard", requireLogin, reset_leaderboard);

//Administrator Routes
route.get("/administrators", requireLogin, administrators);
route.get("/new_admin", requireLogin, new_admin);
route.get("/edit_admin/:id", requireLogin, edit_admin_page);
route.post("/edit_admin", requireLogin, edit_admin);
route.post("/add_admin", requireLogin, add_admin);

//Feedback Routes
route.get("/feedback", requireLogin, feedback);
route.post("/solve_feedback", requireLogin, solve_feedback);//UPDATE
route.post("/delete_feedback", requireLogin, delete_feedback);//DELETE

//Room Routes
route.get("/rooms", requireLogin, rooms);
route.get("/room/:id", requireLogin, room);
route.post("/new_room", requireLogin, new_room);
route.post("/add_to_room", requireLogin, add_to_room);
route.post("/remove_ibeacon", requireLogin, remove_ibeacon);//DELETE

//Miscellaneus
route.get("/database", requireLogin, database);

//Set the routes
app.use(route.routes());


////////////////////////////
//Museum Routes Definition
///////////////////////////
function *login(){
    console.log("Logging in");
    var post = yield parse(this);
    console.log(post);
    for(var i = 0; i < db.users.length; i++){
        if(post.email === db.users[i].email){
            if (post.password === db.users[i].password) {
                this.session.user = db.users[i];
                console.log(this.session.user);
                this.redirect("/");
                break;
            }
            else {
                //yield this.render("login", {error: "Wrong email or password"});
                console.log(1);
                this.redirect("/login");
                break;
            }
        }
    }
}

function *login_page(){
    yield this.render("login");

}

function *index(){
    yield this.render("index", {title : "Home"});
}

function *museum(){
	yield this.render("museum_information", {
        title : "Museum",
        name : db.museum_info.name,
        hours : db.museum_info.hours,
        description : db.museum_info.description
        });
}

function *edit_museum_information(){
    yield this.render("edit_museum_information", {
        title : "Museum",
        name : db.museum_info.name,
        hours : db.museum_info.hours,
        description : db.museum_info.description
    });
}

function *edit_museum(){
    var post = yield parse(this);
    console.log(post);
    
    if(post.name.length != 0)
        db.museum_info.name = post.name;

    if(post.hours.length != 0)
        db.museum_info.hours = post.hours;

    if(post.description.length != 0)
        db.museum_info.description = post.description;
    
    this.redirect("/museum");

}

////////////////////////////
//Exhibition Routes Definition
///////////////////////////
function *exhibitions(){
	yield this.render("exhibitions", {
        title : "Exhibitions",
        exhibitions: db.exhibitions
    });
}

function *exhibition(){
    var exhibition;
    for(var i = 0; i < db.exhibitions.length; i++){
        if(this.params.id == db.exhibitions[i].id){
            exhibition = db.exhibitions[i];
            break;
        }
    }
    var list = [];
    for(var i = 0, k = 0; i < db.objects.length; i++){
        if(exhibition.object_list[k] == db.objects[i].id){
            list.push(db.objects[i]);
            k++;
            i = -1; //offset the counter, need to start at 0
        }
    }

    yield this.render("exhibition",{
        title: exhibition.title,
        description: exhibition.description,
        object_list: list,
        id: exhibition.id
    });
}

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

    if(isNaN(post.object)){

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

////////////////////////////
//Room Routes Definition
////////////////////////////
function *rooms(){
    yield this.render("rooms",{
        title: "Rooms",
        rooms : db.rooms
    });
}

function *room(){
    var room;
    for(var i = 0; i < db.rooms.length; i++){
        if(this.params.id == db.rooms[i].id){
            room = db.rooms[i];
            break;
        }
    }
    yield this.render("room", {
        title: "Room " + room.number,
        id: room.id,
        ibeacon_list: room.current_id
    });
}

function *new_room(){
    db.rooms.push({
        id: db.rooms.length + 1,
        number: db.rooms.length + 1,
        current_id: []
    });
    this.redirect("/rooms");

}

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


////////////////////////////
//Object Routes Definition
////////////////////////////
function *objects(){
	yield this.render("objects", {
        title : "Objects",
        objects: db.objects
    });
}

//Static for the sake of the presentation
function *single_object(){
    yield this.render("single_object", {
        title: db.objects[this.params.id - 1].title,
        object : db.objects[this.params.id - 1]
    });
}

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



////////////////////////////
//Article Routes Definition
////////////////////////////
function *articles(){
	yield this.render("articles", {
        title : "Articles",
        articles:db.articles});
}

function *single_article(){// id as param
    var param_article;
    for(var i = 0; i < db.articles.length; i++){
        if(this.params.id == db.articles[i].id) param_article = db.articles[i];
    }
    yield this.render("single_article", {
        title: param_article.title,
        text: param_article.text,
        date: param_article.date,
        id: param_article.id
    });
}

function *edit_article_page(){ //id as param
    var param_article;
    for(var i = 0; i < db.articles.length; i++){
        if(this.params.id == db.articles[i].id) param_article = db.articles[i];
    }

    yield this.render("edit_article", {
        title: param_article.title,
        text: param_article.text,
        date: param_article.date,
        id: param_article.id
    });
}

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

function *new_article(){
    yield this.render("new_article", {
        title: "New Article"
    });
}

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

////////////////////////////
//Notification Routes Definition
////////////////////////////
function *notifications(){
	yield this.render("notifications", {
        title : "Notifications",
        notifications:db.notifications});
}

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


////////////////////////////
//User Routes Definition
////////////////////////////
function *users(){
	yield this.render("users", {
        title : "Users",
        users : db.users});
}

////////////////////////////
//Leaderboard Routes Definition
////////////////////////////
function *leaderboard(){
	yield this.render("leaderboard", {
        title : "Leaderboard",
        users : db.table.users});
}

function *reset_score(){
    var post = yield parse(this);
    for(var i = 0; i < db.table.users.length; i++){
        if(post.id == db.table.users[i].id) db.table.users[i].score = 0;
    }
    this.redirect("/leaderboard");


}

function *reset_leaderboard(){
    for(var i = 0; i < db.table.users.length; i++){
        db.table.users[i].score = 0;
    }
    this.redirect("/leaderboard");
}

///////////////////////////////
//Admistrator Routes Definition
///////////////////////////////
function *administrators(){
	yield this.render("administrators", {
        title : "Administrators",
        admins : db.users});
}

function *new_admin(){
    yield this.render("new_admin",{
        title: "New Administrator"
    });
}

function *edit_admin_page(){

    var param_admin;
    for(var i = 0; i < db.users.length; i++){
        if(this.params.id == db.users[i].id) param_admin = db.users[i];
    }
    if(param_admin.isAdmin) {
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

////////////////////////////
//Feedback Routes Definition
////////////////////////////
function *feedback(){
	yield this.render("feedback", {
        title : "Feedback",
        feedback:db.feedback});
}

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

////////////////////////////
//Miscellaneous Routes Definition
////////////////////////////
function *database(){
	yield this.render("database", {title : "Database"});
}

function *requireLogin(next){

    if (!this.session.user) {
        console.log("hi");
        this.redirect("/login");
    }
    else {
        yield* next;
    }
}




//Set the port
app.listen(3000);
console.log("Listening on port 3000");

exports.app = app;