var render = require('./js/render');
var koa = require('koa');
var logger = require('koa-logger');
var route = require('koa-route');
var serve = require('koa-static-folder');

var app = koa();
app.use(logger());

app.use(serve('./bower_components'));
app.use(serve('./dist'));
//route
app.use(route.get('/', index));

//route definition
function *index(){
	this.body = yield render('index');
}


app.listen(3000);
console.log("Listening at 3000");
