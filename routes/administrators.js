var parse_multi = require("koa-better-body")(),
    fs = require("fs"),
    rq = require('co-request'),
    Router = require('koa-router'),
    apiUrl = ' http://136.145.116.229:4567';



module.exports = function(){
    var administratorController = new Router();

    administratorController
        .get('/administrator', parse_multi, index)
        .get('/administrator/new', new_administrator)
        .get('/administrator/:id', show)
        .get('/administrator/:id/edit', edit_administrator)
        .post('/administrator', parse_multi, create)
        .post('/administrator/:id', parse_multi, edit)
        .delete('/administrator/:id', destroy)

    return administratorController.routes();
}


/**
 * Render the Administrator Web Page
 */
function *index(){
    var response,
    administrators;

    try {
        //console.log(this.session.user);
        response = yield rq({
            uri : apiUrl + '/administrator',
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
        //Parse
        console.log(response.body);
        administrators = JSON.parse(response.body).administrators;

    } catch(err) {
        this.throw(err.message, err.status || 500);
    }


    yield this.render('administrators', {
        title : 'Administrators',
        admins : administrators
    });
}
/**
 * Render view to create an Administrator Instance
 */
function *new_administrator(){
    yield this.render('new_admin', {
        title : "New Administrator"
    });
}

/**
 * Show a single Administrator instance
 */
function *show(){
    var id = this.params.id,
        response,
        administrator;

    try{
        response = yield rq.get(apiUrl + '/administrator/' + id);
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    administrator = JSON.parse(response.body);

}

/**
 * Render the Edit Administrator View
 */
function *edit_administrator(){
    var id = this.params.id,
        response,
        administrator;

    try {
        response = yield rq.get({
            uri : apiUrl + '/administrator/' + id,
            method : 'GET',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    administrator = JSON.parse(response.body);

    yield this.render('edit_admin', {
        title : "Edit Administrator",
        admin : administrator
    });
}

/**
 * Create a new Administrator Instance
 */
function *create(){
    var body = this.request.body.fields,
        response;

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/administrator/',
            method : 'POST',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/administrator');
    }
}

/**
 * Update an instance of Administrator
 */
function *edit(){
    var body = this.request.body.fields,
        id = this.params.id,
        response;

    if(!body) {
        this.throw('Bad Request', 400);
    }

    try {
        response = yield rq({
            uri : apiUrl + '/administrator/' + id,
            method : 'PUT',
            json : true,
            body : body,
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err){
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/administrator');
    }
}

/**
 * Destroy an instance of Administrator
 */
function *destroy(){
    var id = this.params.id,
        response;

    try {
        response = yield rq({
            uri : apiUrl + '/administrator/' + id,
            method : 'DELETE',
            headers : {
                Authorization : 'Bearer ' + this.session.user}
        });
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    if(response.statusCode == 200){
        this.redirect('/administrator');
    }
}

