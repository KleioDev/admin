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


    describe('GET /news', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(
            request.get('/news').expect(200));
        });
    });

    describe('GET /news/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/news/1').expect(200));
        });
    });
    describe('GET /news/10', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/news/10').expect(200));
        });
    });
    describe('GET /edit_article/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/edit_article/1').expect(200));
        });
    });
    describe('GET /edit_article/10', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/edit_article/10').expect(200));
        });
    });
    describe('GET /new_article', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/new_article').expect(200));
        });
    });

});