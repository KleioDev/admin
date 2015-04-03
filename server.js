//Dependencies
var koa = require("koa");
var logger = require("koa-logger");
var views = require("koa-views");
var Router = require("koa-router");
var serve = require("koa-static-folder");
var handlebars = require("koa-handlebars");
var parse = require("co-body");
var route = new Router();

//DB
var db = require("./js/db");

//Start the app
var app = koa();
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

//Serve components
app.use(serve("./js"));
app.use(serve("./dist"));
app.use(serve("./bower_components"));
app.use(serve("./img"));
app.use(serve("./audio"));

//Set routes
route.get("/", index);
route.get("/museum", museum);
route.get("/exhibitions", exhibitions);
route.get("/objects", objects);
route.get("/articles", articles);
route.get("/notifications", notifications);
route.get("/users", users);
route.get("/leaderboard", leaderboard);
route.get("/administrators", administrators);
route.get("/feedback", feedback);
route.get("/database", database);
route.get("/login", login);
route.get("/rooms", rooms);
route.get("/new_admin", new_admin);
route.get("/edit_admin/:id", edit_admin);
route.get("/single_object/:id", single_object);
route.get("/edit_museum_information", edit_museum_information);
route.get("/article/:id", single_article);
route.get("/edit_article/:id", edit_article);
route.get("/new_article", new_article);
route.get("/exhibition/:id", exhibition);
route.get("/room/:id", room);

route.post("/create_notification", create_notification);
route.post("/edit_admin/:id", edit_admin);
route.delete("/delete_notification/:id", delete_notification);
route.post("/edit_article/:id", edit_article);
route.post("/add_article", add_article);
route.delete("/delete_article/:id", delete_article);
route.post("/solve_feedback/:id", solve_feedback);
route.delete("/delete_feedback/:id", delete_feedback);
route.post("/reset_score", reset_score);
route.post("/reset_leaderboard", reset_leaderboard);
route.post("/upload_audio", upload_audio);
route.post("/delete_audio/:id", delete_audio);
route.post("/delete_text/:id", delete_text);
route.post("/add_text", add_text);
route.post("/delete_image/:id", delete_image);
route.post("/add_image", add_image);
route.post("/delete_video/:id", delete_video);
route.post("/add_video", add_video);
route.post("/new_exhibition", new_exhibition);
route.post("/add_to_exhibition", add_to_exhibition);
route.post("/remove_from_exhibition/:id", remove_from_exhibition);
route.post("/new_room", new_room);
route.post("/remove_ibeacon/:id", remove_ibeacon);



app.use(route.routes());


//Route definition
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

function *exhibitions(){
	yield this.render("exhibitions", {
        title : "Exhibitions",
        exhibitions: db.exhibitions
    });
}

function *rooms(){
    yield this.render("rooms",{
        title: "Rooms",
        rooms : db.rooms
    });
}

function *objects(){
	yield this.render("objects", {
        title : "Objects",
        objects: db.objects
    });
}

function *articles(){
	yield this.render("articles", {
        title : "Articles",
        articles:db.articles});
}

function *notifications(){
	yield this.render("notifications", {
        title : "Notifications",
        notifications:db.notifications});
}

function *users(){
	yield this.render("users", {
        title : "Users",
        users : db.users});
}

function *leaderboard(){
	yield this.render("leaderboard", {
        title : "Leaderboard",
        users : db.table.users});
}

function *administrators(){
	yield this.render("administrators", {
        title : "Administrators",
        admins : db.users});
}

function *feedback(){
	yield this.render("feedback", {
        title : "Feedback",
        feedback:db.feedback});
}

function *database(){
	yield this.render("database", {title : "Database"});
}

function *login(){
    yield this.render("login");
}

function *new_admin(){
    yield this.render("new_admin",{
        title: "New Administrator"
    });
}

function *edit_admin(){

    //TODO: Add proper algorithm for finding the admin info and return 404 status code
    var param_admin = db.users[this.params.id - 1];
    console.log(param_admin);
    if(param_admin.isAdmin) {
        yield this.render("edit_admin", {
            title: "Edit Administrator",
            admin: param_admin
        });
    }
    else{
        yield this.render("404", {
            title: "Wrong User"
        });
    }
}

function *single_object(){
    yield this.render("single_object", {
        object : db.objects[this.params.id - 1]
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


function *single_article(){// id as param
    var param_article = db.articles[this.params.id - 1];
    yield this.render("single_article", {
        title: param_article.title,
        text: param_article.text,
        date: param_article.date,
        id: param_article.id

    });

}

function *edit_article(){ //id as param
    var param_article = db.articles[this.params.id - 1];

    yield this.render("edit_article", {
        title: param_article.title,
        text: param_article.text,
        date: param_article.date,
        id: param_article.id
    });
}

function *new_article(){
    yield this.render("new_article", {
        title: "New Article"
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
    //Simulate join
    var list = [];
    for(var i = 0, k = 0; i < db.objects.length; i++){
        if(db.objects[i].id == exhibition.object_list[k]){
            list.push(db.objects[i]);
            k++;
            i = 0;
        }
    }

    yield this.render("exhibition",{
        title: exhibition.title,
        description: exhibition.description,
        object_list: list,
        id: exhibition.id

    })
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
        ibeacon_list: room.current_id
    });
}
function *create_notification(){
    var post = yield parse(this);
    console.log(post);
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
    for(var i = 0; i < db.notifications.length; i++){
        if(this.params.id == db.notifications[i].id){
            db.notifications.splice(i, 1);
            break;
        }
    }
    //NOT REDIRECTING
     this.redirect("/notifications");

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
    for(var i = 0; i < db.articles.length; i++){
        if(this.params.id == db.articles[i].id){
            db.articles.splice(i, 1);
            break;
        }
    }
    this.redirect("/articles");
}

function *solve_feedback(){
    for(var i = 0; i < db.feedback.length; i++){
        if(this.params.id == db.feedback[i].id){
            db.feedback.solved = true;
            break;
        }
    }
    this.redirect("/feedback");

}

function *delete_feedback(){
    for(var i = 0; i < db.feedback.length; i++){
        if(this.params.id == db.feedback[i].id){
            db.feedback.splice(i, 1);
            break;
        }
    }
    this.redirect("/feedback");
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

function *upload_audio(){

}

function *delete_audio(){


}

function *delete_text(){

}

function *add_text(){

}

function *delete_image(){

}

function *add_image(){

}

function *delete_video(){

}

function *add_video(){

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
        }
    }

    for(var i = 0; i < db.exhibitions[exhibition_index].object_list.length; i++){//check if its already in the list
        if(post.object == db.exhibitions[exhibition_index].object_list[i]) present = true;
    }
    if(!present) db.exhibitions[exhibition_index].object_list.push(post.object); //if not, add it
    this.redirect("/exhibition/" + post.id);
}

function *remove_from_exhibition(){

}

function *new_room(){

}

function *remove_ibeacon(){

}





//Set the port
app.listen(3000);
console.log("Listening on port 3000");