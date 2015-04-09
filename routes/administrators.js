var parse_multi = require("koa-better-body")(),
    fs = require("fs"),
    rq = require('co-request'),
    Router = require('koa-router');



module.exports = function(){
    var administratorController = new Router();

    administratorController
        .get('/administrator', parse_multi, index)
        .get('/administrator/new', new_administrator)
        .get('/administrator/:id', show)
        .get('/administrator/:id/edit', edit_administrator)
        .post('/administrator', create)
        .put('/administrator/:id', edit)
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
        response = yield rq.get('http://localhost:4567/administrator')
    } catch(err) {
        this.throw(err.message, err.status || 500);
    }

    //Parse
    administrators = JSON.parse(response.body).administrators;


    yield this.render('administrators', {
        title : 'Administrators',
        admins : administrators
    });
}
/**
 * Render view to create an Administrator Instance
 */
function *new_administrator(){

}

/**
 * Show a single Administrator instance
 */
function *show(){

}

/**
 * Render the Edit Administrator View
 */
function *edit_administrator(){

}

/**
 * Create a new Administrator Instance
 */
function *create(){

}

/**
 * Update an instance of Administrator
 */
function *edit(){

}

/**
 * Destroy an instance of Administrator
 */
function *destroy(){

}

/**
 * Render the New Administrator page.
 */
new_admin = function(){
    function *new_admin(){
        yield this.render("new_admin",{
            title: "New Administrator"
        });
    }
    return new_admin;
};

/**
 * Render the Edit Administrator page.
 * If the id passed belongs to a user that is not an admin or a user
 * at all, render 404.
 */
 edit_admin_page = function(){
    function *edit_admin_page(){

        var param_admin;
        var set = false;
        for(var i = 0; i < db.users.length; i++){
            if(this.params.id == db.users[i].id){
                param_admin = db.users[i];
                set = true;
                break;
            }
        }
        if(set && param_admin.isAdmin) {
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
    return edit_admin_page;
};

/**
 * Parse the user information to update information given.
 */
edit_admin = function(){
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
    return edit_admin;
};

/**
 * Parse the user information to create a new admin (user).
 * Admins may be separated from users during integration.
 */

add_admin = function(){
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
    return add_admin;
};
