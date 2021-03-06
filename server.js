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
var museum = require("./routes/museum");
var exhibitions = require("./routes/exhibitions");
var rooms = require("./routes/rooms");
var artifacts = require("./routes/artifacts");
var news = require("./routes/news");
var users = require("./routes/users");
var leaderboard = require("./routes/leaderboard");
var administrator = require("./routes/administrators");
var feedback = require("./routes/feedback");
var login = require("./routes/login");
var events = require("./routes/events");
var config = require("./config/config");



//Start the app
var app = koa();

//Authentication
app.keys = [config.secret];
app.duration = config.sessionDuration;
app.activeDuration = config.sessionActiveDuration;
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
                if(obj.length < 60) return obj;
                else return obj.substring(0, 60) + "(...)";
            },
            /**
             * Prints out information about the current object
             * @param obj The current object
             */
            debug: function(obj){
                console.log("Working.");
                console.log(obj);
                return "<script>var a = 10;</script>"
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
                    string += "<td>" + obj[i].email + "</td>";
                    string += "<td>" + obj[i].points + "</td>";
                    string += "<td style=\"text-align:center;\"><form action=\"/reset_score/" + obj[i].id + "\" method=\"post\">" +
                        "<button type=\"submit\" class=\"btn btn-danger\"><i class=\"glyphicon glyphicon-remove-sign\"></i></button></form></td></tr>";
                }
                return string;
            },
            /**
             * Displays the correct language
             * @param obj either 'esp' or 'eng'
             * @returns {string} 'Spanish' or 'English'
             */
            language: function(obj){
                if(obj === "esp") return "Español";
                else return "English";
            },
            /**
             * Displays the correct exhibition in an artifact
             * @param obj the exhibition
             * @returns {string} the exhibition name or 'No exhibition attached'
             */
            exhibitionRender: function(obj){
                if(obj)
                    return "<a href=\"/exhibition/" + obj.id + "\">" + obj.title + " - " + obj.description + "</a>";
                else
                    return "No exhibition attached";
            },
            /**
             * Displays user analytics.
             */
            morrisbar: function(obj){
                var string = '[';
                for(var i = 0; i < obj.length; i++){
                    string += JSON.stringify(obj[i]);
                    if(i != obj.length - 1) string += ',';
                }
                string += ']';
                return "<script>$(function() {Morris.Bar({element: 'morris-bar-chart',data: " + string + ", xkey: 'period', ykeys: ['active', 'interactive'], labels: ['Active Users', 'Interactive Users'], hideHover: 'auto', resize: true});});</script>";


            },
            /**
             * Displays download analytics.
             */
            morrisdonut: function(obj){
                return "<script>$(function(){Morris.Donut({element: 'morris-donut-chart', data: [{label: 'IOS', value: " + obj.ios + "}, {label: 'Android', value: " + obj.android + "}], resize: true})});</script>";
            },
            feedbackType: function(obj){
                if(obj === "general") return "General";
                if(obj === "bug") return "Application Bug";
                else return "Content Problem";
            },
            checked: function(obj){
                if(obj) return "checked='true'";
                else return '';
            },
            cap: function(obj){
                if(obj === "male") return "Male";
                else if (obj === "female") return "Female";
                else return "Undefined"
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
app.use(news());
app.use(users());
app.use(rooms());
app.use(artifacts());
app.use(exhibitions());
app.use(events());
app.use(function*(){
    if(this.status == 404) this.redirect("/404");
});

//Set the app to listen at the port
app.listen(3000);
console.log("Listening on port 3000");

//Export the app for testing purposes
exports.app = app;