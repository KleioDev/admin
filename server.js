//Dependencies
var koa = require("koa");
var logger = require("koa-logger");
var views = require("koa-views");
var route = require("koa-route");
var serve = require("koa-static-folder");
var handlebars = require("koa-handlebars");

//DB
var table = require("./js/leaderboard_table");


//Start the app
var app = koa();
app.use(handlebars({
    defaultLayout: "main",
    partialsDir : "./views",
    helpers:
        {list_user: function(items, options){
            var string = "";
            for(var i = 0; i < table.table.users.length; i++){
                string = string + "<tr>" + "<td>" + (i+1) + "</td>";
                string = string + "<td>" + table.table.users[i].name + "</td>";
                string = string + "<td>" + table.table.users[i].score + "</td>";
                string = string + "<td><a href=\"#\"><i class=\"fa fa-trash-o fa-fw\"></i></a></td></tr>";
            }
            console.log(string);
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


//Set the template engine



//Set routes
app.use(route.get("/", index));
app.use(route.get("/museum", museum));
app.use(route.get("/exhibitions", exhibitions));
app.use(route.get("/objects", objects));
app.use(route.get("/articles", articles));
app.use(route.get("/notifications", notifications));
app.use(route.get("/users", users));
app.use(route.get("/leaderboard", leaderboard));
app.use(route.get("/administrators", administrators));
app.use(route.get("/feedback", feedback));
app.use(route.get("/database", database));

//Route definition
function *index(){
	yield this.render("index", {title : 'Home'});
}

function *museum(){
	yield this.render("museum_information", {title : 'Museum'});
}

function *exhibitions(){
	yield this.render("group_management", {title : 'Exhibitions'});
}

function *objects(){
	yield this.render("objects", {title : 'Objects'});
}

function *articles(){
	yield this.render("articles", {title : 'Articles'});
}

function *notifications(){
	yield this.render("notifications", {title : 'Notifications'});
}

function *users(){
	yield this.render("users", {title : 'Users'});
}

function *leaderboard(){
	yield this.render("leaderboard", {title : 'Leaderboard'});
}

function *administrators(){
	yield this.render("administrators", {title : 'Administrators'});
}

function *feedback(){
	yield this.render("feedback", {title : 'Feedback'});
}

function *database(){
	yield this.render("database", {title : 'Database'});
}

//Set the port
app.listen(3000);
console.log("Listening on port 3000");