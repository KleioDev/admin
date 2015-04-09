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
//var db = require("./public/js/db");
//var museum = require("./routes/museum");
//var exhibitions = require("./routes/exhibitions");
//var rooms = require("./routes/rooms");
//var objects = require("./routes/objects");
//var articles = require("./routes/articles");
//var notifications = require("./routes/notifications");
//var users = require("./routes/users");
//var leaderboard = require("./routes/leaderboard");
var administrator = require("./routes/administrators");


//Start the app
var app = koa();


//Authentication
app.keys = ['secret'];
app.use(session(app));
//
///**
// * Anonymous function:
// * When logged in, delete the password from the session
// * for security purposes.
// */
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
//
///**
// * handlebars()
// * Set up the templating engine and helper functions
// */
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
//
///**
// * Set the logger
// */
//app.use(logger());
//
///**
// * Serve components for the web page
// */
//
app.use(serve("./public"));
app.use(serve('./bower_components'));
//
//
///**
// * Route specification
// */
//
///**
// * Login routes
// */
//route.post("/login", login);
//route.get("/login", login_page);
//route.get("/logout", function*() {
//    console.log(this.session.user);
//    this.session = null;
//    this.redirect("login");
//});
//route.get("/", requireLogin, index);
//
///**
// * Museum routes
// */
//route.get("/museum", requireLogin, museum.museum());
//route.get("/edit_museum_information", requireLogin, museum.edit_museum_information());
//route.post("/edit_museum", requireLogin, museum.edit_museum());
//
///**
// * Exhibitions routes
// */
//route.get("/exhibitions", requireLogin, exhibitions.exhibitions());
//route.get("/exhibition/:id", requireLogin, exhibitions.exhibition());
//route.post("/new_exhibition", requireLogin, exhibitions.new_exhibition());
//route.post("/add_to_exhibition", requireLogin, exhibitions.add_to_exhibition());
//route.post("/remove_from_exhibition", requireLogin, exhibitions.remove_from_exhibition());
//
///**
// * Object routes
// */
//route.get("/objects", requireLogin, objects.objects());
//route.get("/single_object/:id", requireLogin, objects.single_object());
//route.post("/upload_audio", requireLogin, parse_multi({
//    multipart: true,
//    formidable: {
//        uploadDir: 'audio/'
//    }
//}), objects.upload_audio());
//route.post("/delete_audio", requireLogin, objects.delete_audio());//DELETE
//route.post("/add_text", requireLogin, objects.add_text());
//route.post("/delete_text", requireLogin, objects.delete_text());//DELETE
//route.post("/add_image", requireLogin, parse_multi({
//    multipart: true,
//    formidable: {
//        uploadDir: 'img/'
//    }
//}), objects.add_image());
//route.post("/delete_image", requireLogin, objects.delete_image());//DELETE
//route.post("/add_video", requireLogin, objects.add_video());
//route.post("/delete_video", requireLogin, objects.delete_video());//DELETE
//
///**
// * Article routes
// */
//route.get("/articles", requireLogin, articles.articles());
//route.get("/article/:id", requireLogin, articles.single_article());
//route.get("/edit_article/:id", requireLogin, articles.edit_article_page());
//route.get("/new_article", requireLogin, articles.new_article());
//route.post("/edit_article", requireLogin, articles.edit_article());
//route.post("/add_article", requireLogin, articles.add_article());
//route.post("/delete_article", requireLogin, articles.delete_article());//DELETE
//
///**
// * Notification routes
// */
//route.get("/notifications", requireLogin, notifications.notifications());
//route.post("/create_notification", requireLogin, notifications.create_notification());
//route.post("/delete_notification", requireLogin, notifications.delete_notification());//DELETE
//
///**
// * User routes
// */
//route.get("/users", requireLogin, users.users());
//
///**
// * Leaderboard routes
// */
//route.get("/leaderboard", requireLogin, leaderboard.leaderboard());
//route.post("/reset_score", requireLogin, leaderboard.reset_score());
//route.post("/reset_leaderboard", requireLogin, leaderboard.reset_leaderboard());
//
///**
// * Administrator routes
// */
//route.get("/administrator", administrators.index);
//route.get("/new_admin", requireLogin, administrators.new_admin());
//route.get("/edit_admin/:id", requireLogin, administrators.edit_admin_page());
//route.post("/edit_admin", requireLogin, administrators.edit_admin());
//route.post("/add_admin", requireLogin, administrators.add_admin());
//
///**
// * Feedback Routes
// */
//route.get("/feedback", requireLogin, feedback);
//route.post("/solve_feedback", requireLogin, solve_feedback);//UPDATE
//route.post("/delete_feedback", requireLogin, delete_feedback);//DELETE
//
///**
// * Room routes
// */
//route.get("/rooms", requireLogin, rooms.rooms());
//route.get("/room/:id", requireLogin, rooms.room());
//route.post("/new_room", requireLogin, rooms.new_room());
//route.post("/add_to_room", requireLogin, rooms.add_to_room());
//route.post("/remove_ibeacon", requireLogin, rooms.remove_ibeacon());
//
///**
// * Miscellaneous
// */
//route.get("/database", requireLogin, database);
//
////Set the routes
app.use(administrator());
//
///******************************************************************************
// * Route Definitions
// */
//
///**
// * Parses the information, verifies that the user exists and matches the password.
// * If the user is matched, redirect to root.
// * If not, redirect to /login.
// */
//function *login(){
//    var post = yield parse(this);
//    var found = false;
//    for(var i = 0; i < db.users.length; i++){
//        if(post.email === db.users[i].email && db.users[i].isAdmin){
//            if (post.password === db.users[i].password) {
//                this.session.user = db.users[i];
//                this.redirect("/");
//                found = true;
//                break;
//            }
//            else {
//
//                this.redirect("/login");
//                break;
//            }
//        }
//    }
//    if(!found) this.redirect("/login");
//}
//
///**
// * Render the login page.
// */
//function *login_page(){
//    yield this.render("login");
//
//}
//
///**
// * Render the Home page (root).
// */
//function *index(){
//    yield this.render("index", {title : "Home"});
//}
//
//
///******************************************************************************
// * Feedback route definitions
// */
//
///**
//  * Render Feedback page.
//  */
//function *feedback(){
//	yield this.render("feedback", {
//        title : "Feedback",
//        feedback:db.feedback});
//}
//
///**
//  * Parse feedback information to mark the feedback as solved.
//  */
//function *solve_feedback(){
//    var post = yield parse(this);
//    for(var i = 0; i < db.feedback.length; i++){
//        if(post.id == db.feedback[i].id){
//            db.feedback[i].solved = true;
//            break;
//        }
//    }
//    this.redirect("/feedback");
//
//}
//
///**
//  * Parse feedback information to delete it.
//  * Only feedback marked as solved may be deleted.
//  */
//function *delete_feedback(){
//    var post = yield parse(this);
//    for(var i = 0; i < db.feedback.length; i++){
//        if(post.id == db.feedback[i].id){
//            db.feedback.splice(i, 1);
//            break;
//        }
//    }
//    this.redirect("/feedback");
//}
//
///******************************************************************************
// * Administrator route definitions
// */
//
// /**
//  * Not implemented yet.
//  */
//function *database(){
//	yield this.render("database", {title : "Database"});
//}
//
///**
// * Makes the application require login throughout the whole app.
// */
//function *requireLogin(next){
//
//    if (!this.session.user) {
//        this.redirect("/login");
//    }
//    else {
//        yield* next;
//    }
//}

//Set the app to listen at the port
app.listen(3000);
console.log("Listening on port 3000");

//Export the app for testing purposes
exports.app = app;