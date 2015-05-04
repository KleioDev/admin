var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");
var admin = require("../config/config").admin;
var password = require("../config/config").password;
var cred = {email:admin, password: password};


request = supertest(app.callback());

describe('Rooms', function(){

    describe('GET /rooms', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/rooms').expect(200));
        });
    });
    describe('GET /room/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/room/1').expect(200));
        });
    });
    describe('GET /room/100', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/room/100').expect(404));
        });
    });
    describe('GET /room/1/edit', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/room/1/edit').expect(200));
        });
    });
    describe('GET /room/100edit', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(
                request.get('/room/100edit').expect(404));
        });
    });

});