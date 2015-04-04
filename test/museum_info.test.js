var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var museum_info = require('../js/db.js').museum_info;

describe('Museum', function(){

    describe('GET /museum', function(){

        it('should return a status of 200', function *(){
            yield request.get('/museum').expect(200);
        });
    });

});