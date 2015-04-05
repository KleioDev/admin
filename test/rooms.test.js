var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");


request = supertest(app.callback());
var rooms = require('../js/db.js').rooms;

describe('Rooms', function(){

    describe('GET /rooms', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/rooms').expect(200));
        });
    });
    describe('GET /room/1', function(){

        it('should return a status of 302 redirecting to 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/room/1').expect(200));
        });
    });
    describe('GET /room/100', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/room/1').expect(404));
        });
    });

});