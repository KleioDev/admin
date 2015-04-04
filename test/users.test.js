var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var users = require('../js/db.js').users;

describe('Users', function(){

    describe('GET /users', function(){

        it('should return a status of 200', function *(){
            yield request.get('/users').expect(200);
        });
    });

});