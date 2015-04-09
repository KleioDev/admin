var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");


request = supertest(app.callback());
var objects = require('./db.js').objects;

describe('Objects', function(){

    describe('GET /objects', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/objects').expect(200));
        });
    });
    describe('GET /single_object/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/objects').expect(200));
        });
    });
    describe('GET /single_object/100', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/single_object/100').expect(200));
        });
    });

});