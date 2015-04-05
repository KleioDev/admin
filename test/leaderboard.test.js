var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");
var assert = require('assert');


request = supertest(app.callback());
var leaderboard_users = require('../js/db.js').table.users;

describe('Leaderboard', function(){

    describe('GET /leaderboard', function(){

        it('should return a status of 200', function *() {
            yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
                request.get('/leaderboard').expect(200));
        });
    });

    //describe('POST /reset_score', function(){
    //
    //    it('Should reset User 1\'s score', function *(){
    //        yield request.post("/login").send({email:"admin@upr.edu", password:"123456"}).then(
    //            request.post('/reset_score').send({id: 1}).end(function(err, res){
    //            expect(res).to.have.status(200);
    //        }));
    //    });
    //});

    //describe('POST /reset_leaderboard', function(){
    //
    //    it('Should reset all scores', function *(){
    //        request.post("/login").send({email:"admin@upr.edu", password:"123456"}).end();
    //        request.post('/reset_leaderboard').end();
    //        //expect(res).to.have.status(200);
    //        var flag = true;
    //        for(var i = 0; i < leaderboard_users.length; i++){
    //            if(leaderboard_users[i].score != 0) flag = false;
    //        }
    //        assert(flag);
    //    });
    //});
});