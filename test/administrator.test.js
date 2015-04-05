var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require('co-mocha');
var assert = require("assert");

request = supertest(app.callback());
var administrators = require('../js/db.js').users;

describe('Administrators', function(){

    //var agent = supertest.agent();
    //before(function(done){
    //    request(app)
    //        .post('/login')
    //        .send({
    //            username: 'admin@upr.edu',
    //            password: '123456'
    //        })
    //        .end(function (err, res) {
    //            if(err) throw err;
    //            agent.saveCookies(res);
    //            done(agent);
    //        });
    //
    //});
    describe('GET /administrators', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/administrators').expect(200));
        });
    });

    describe('GET /new_admin', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/new_admin').expect(200));
        });
    });

    describe('GET /edit_admin/1', function(){

        it('should return a status of 200', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/edit_admin/1').expect(200));
        });
    });
    describe('GET /edit_admin/2', function(){

        it('should return a status of 404', function *(){
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/edit_admin/2').expect(404));
        });
    });

    //describe('POST /edit_admin', function(){
    //
    //    it('should change admin\'s name', function *(){
    //        request.post("/login").send({email:"admin@upr.edu", password:"123456"}).end();
    //        request.post('/edit_admin').send({admin_first:"Test", admin_last:"", admin_email:""}).end();
    //        var flag = false;
    //        for(var i = 0; i < administrators.length; i++){
    //            if(administrators[i].id == 2){
    //                if(administrators[i].first_name == "Test"){
    //                    flag = true;
    //                    break;
    //                }
    //            }
    //        }
    //        assert(flag);
    //    });
    //});

});