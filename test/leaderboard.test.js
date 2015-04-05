var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var leaderboard_users = require('../js/db.js').table.users;

describe('Leaderboard', function(){

    describe('GET /leaderboard', function(){

        it('should return a status of 200', function *() {
            yield request.get('/leaderboard').expect(200);
        });
    });

    describe('POST /reset_score', function(){

        it('Should reset User 1\'s score', function *(){
            yield request.post('/reset_score').field('id', 1).end(function(err, res){
                expect(res).to.have.status(200);
            });
        });
    });

    describe('POST /reset_leaderboard', function(){

        it('Should reset all scores', function *(){
            yield request.post('/reset_leaderboard').send();
            var flag = true;
            for(var i = 0; i < leaderboard_users.length; i++){
                if(leaderboard_users[1].score != 0) flag = false;
            }
            expect(flag).equal(true);

        });
    });

});