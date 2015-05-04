var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require('co-mocha');
var assert = require("assert");
var admin = require("../config/config").admin;
var password = require("../config/config").password;
var auth = require("../config/config").auth;
var cred = {email:admin, password: password};

var request = supertest(app.callback());

describe('Administrators', function(){

    //var agent = supertest.agent(app.callback());
    //before(function*(done){
    //     yield request
    //        .post('/login')
    //        .send({
    //            email: admin,
    //            password: password
    //        })
    //        .end(function (err, res) {
    //            if(err) throw err;
    //            agent.saveCookies("Bearer " + res);
    //            done(agent);
    //        });
    //
    //});

    describe('GET /administrator', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/administrator').expect(200));
            //yield request.get("/administrator").set("Authorization", auth).end().expect(302);
        });
    });

    describe('GET /administrator', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/administrator').expect(200));

        });
    });

    describe('GET /administrator/1', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/administrator/1').expect(200));

        });
    });
    describe('GET /administrator/3/edit', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send(cred).then(request.get('/administrator/3/edit').expect(200));

        });
    });
    describe('GET /administrator/100', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send(cred).then(request.get('/administrator/100').expect(404));

        });
    });

});