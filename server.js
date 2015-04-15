// Load the dependencies
var koa = require("koa");
var logger = require("koa-logger");
var views = require("koa-views");
var Router = require("koa-router");
var serve = require("koa-static-folder");
var handlebars = require("koa-handlebars");
var fs = require("fs");
var session = require("koa-session");

/**
 * Require the dummy database
 * @type {exports} lists containing dummy information
 */
var db = require("./public/js/db");
var museum = require("./routes/museum");
var exhibitions = require("./routes/exhibitions");
var rooms = require("./routes/rooms");
var objects = require("./routes/objects");
var articles = require("./routes/articles");
var notifications = require("./routes/notifications");
var users = require("./routes/users");
var leaderboard = require("./routes/leaderboard");
var administrator = require("./routes/administrators");
var feedback = require("./routes/feedback");
var login = require("./routes/login");
var events = require("./routes/events");

//Start the app
var app = koa();

//Authentication
app.keys = ['secret'];
app.duration = 24 * 60 * 60 * 1000;
app.activeDuration = 24 * 60 * 60 * 1000;
app.use(session(app));


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
            list_user: function(obj){
                var string = "";
                for(var i = 0; i < obj.length; i++){
                    string += "<tr>" + "<td>" + (i+1) + "</td>";
                    string += "<td>" + obj[i].firstName + " " + obj[i].lastName + "</td>";
                    string += "<td>" + obj[i].points + "</td>";
                    string += "<td style=\"text-align:center;\"><form action=\"/reset_score\" method=\"post\"><input hidden=\"true\" value=\"" +
                        obj[i].id +
                        "\" name=\"id\"><button type=\"submit\" class=\"btn btn-danger\"><i class=\"fa fa-trash-o fa-fw\"></i></button></form></td></tr>";
                    }
                return string;
            }
        }
    }));

/**
* Set the logger
*/
//app.use(logger());

/**
* Serve components for the web page
*/
app.use(serve("./public"));
app.use(serve('./bower_components'));


//Set the routes
app.use(administrator());
app.use(leaderboard());
app.use(feedback());
app.use(login());
app.use(museum());
app.use(notifications());
app.use(articles());
app.use(users());
app.use(rooms());
app.use(objects());
app.use(exhibitions());
app.use(events());

//Set the app to listen at the port
app.listen(3000);
console.log("Listening on port 3000");

//Export the app for testing purposes
exports.app = app;




///**
// * Miscellaneous
// */
//route.get("/database", requireLogin, database);
// /**
//  * Not implemented yet.
//  */
//function *database(){
//	yield this.render("database", {title : "Database"});
//}

///**
//* Anonymous function:
//* When logged in, delete the password from the session
//* for security purposes.
//*/
//app.use(function *(next) {
//    if (this.session && this.session.user) {
//        for(var i = 0; i < db.users.length; i++){
//            if(this.session.email === db.users[i].email){//Find the user
//                this.request.user = db.users[i];
//                delete this.request.user.password; // delete the password from the session
//                this.session.user = db.users[i];  //refresh the session value
//                this.response.locals.user = db.users[i];
//            }
//        }
//        yield next;
//    }
//    else {
//        yield next;
//    }
//});