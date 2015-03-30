//Dependencies
var koa = require("koa");
var logger = require("koa-logger");
var views = require("koa-views");
var Router = require("koa-router");
var serve = require("koa-static-folder");
var handlebars = require("koa-handlebars");
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
                return obj.substring(0, 100) + "...";
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
                    string += "<td><a href=\"#\"><i class=\"fa fa-trash-o fa-fw\"></i></a></td></tr>";
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



//Set the template engine



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

route.get("/new_admin", new_admin);
route.get("/edit_admin/:id", edit_admin);
route.get("/single_object/:id", single_object);

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
	yield this.render("rooms", {
        title : "Exhibitions",
        rooms : db.rooms});
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


//Set the port
app.listen(3000);
console.log("Listening on port 3000");