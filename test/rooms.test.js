var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var rooms = require('../js/db.js').rooms;

describe('Rooms', function(){

    describe('GET /rooms', function(){

        it('should return a status of 200', function *(){
            yield request.get('/rooms').expect(200);
        });
    });

});