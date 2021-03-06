var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");
var assert = require("assert");
var admin = require("../config/config").admin;
var password = require("../config/config").password;
var cred = {email:admin, password: password};

request = supertest(app.callback());

describe('Museum', function(){
    describe('GET /', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/').expect(200));
        });
    });

    describe('GET /museum', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/museum').expect(200));
        });
    });

    describe('GET /edit_museum_information', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/edit_museum_information').expect(200));
        });
    });

    //describe('POST /edit_museum', function(){
    //
    //    it('should change the museum\'s name', function (){
    //        request.post("/login").send({email:"admin@upr.edu", password:"123456"}).end();
    //        request.post('/edit_museum').send({name:"Musa", hours:"tst", description:"tst"}).end();
    //        assert(museum_info.name == "Musa");
    //    });
    //});

});