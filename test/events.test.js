var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");
var admin = require("../config/config").admin;
var password = require("../config/config").password;
var cred = {email:admin, password: password};



request = supertest(app.callback());

describe('News', function(){


    describe('GET /events', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/events').expect(200));
        });
    });

    describe('GET /event/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/event/4').expect(200));
        });
    });
    describe('GET /event/10', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(request.get('/event/100').expect(404));
        });
    });
    describe('GET /event/1/edit', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/edit_article/1').expect(200));
        });
    });
    describe('GET /event/100/edit', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(request.get('/event/100/edit').expect(404));
        });
    });
    describe('GET /new_event', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/new_event').expect(200));
        });
    });

});