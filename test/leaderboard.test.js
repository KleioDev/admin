var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
leaderboard_users = require('../js/db.js').table.users;

describe('Leaderboard', function(){

    describe('GET /exhibition', function(){

        it('should return a status of 200', function *(){
            yield request.get('/exhibition').expect(200);
        });
    });

});