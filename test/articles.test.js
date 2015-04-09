var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");



request = supertest(app.callback());
var db = require('./db.js');

describe('Articles', function(){


    describe('GET /articles', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
            request.get('/articles').expect(200));
        });
    });

    describe('GET /article/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/article/1').expect(200));
        });
    });
    describe('GET /article/10', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/article/10').expect(200));
        });
    });
    describe('GET /edit_article/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/edit_article/1').expect(200));
        });
    });
    describe('GET /edit_article/10', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/edit_article/10').expect(200));
        });
    });
    describe('GET /new_article', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/new_article').expect(200));
        });
    });

});