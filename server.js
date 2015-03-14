var render = require('./js/render');
var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');
var serve = require('koa-static-folder');

var app = koa();
app.use(logger());

app.use(serve('./bower_components'));
app.use(serve('./dist'));
app.use(serve('./js'));

//Routes
app.use(route.get('/', index));
app.use(route.get('/museum', museum));
app.use(route.get('/exhibitions', exhibitions));
app.use(route.get('/objects', objects));
app.use(route.get('/articles', articles));
app.use(route.get('/notifications', notifications));
app.use(route.get('/users', users));
app.use(route.get('/leaderboard', leaderboard));
app.use(route.get('/administrators', administrators));
app.use(route.get('/feedback', feedback));
app.use(route.get('/database', database));


//Route definition
//Renders each page
function *index(){
	this.body = yield render('index');
}
function *museum(){
	this.body = yield render('museum_information');
}

function *exhibitions(){
	this.body = yield render("group_management");
}

function *objects(){
	this.body = yield render("objects");
}

function *articles(){
	this.body = yield render("articles");
}

function *notifications(){
	this.body = yield render("notifications");
}

function *users(){
	this.body = yield render("users");
}

function *leaderboard(){
	this.body = yield render("leaderboard");
}

function *administrators(){
	this.body = yield render("administrators");
}

function *feedback(){
	this.body = yield render("feedback");
}

function *database(){
	this.body = yield render("database");
}


app.listen(3000);
console.log("Listening at 3000");
