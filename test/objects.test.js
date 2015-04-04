var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var objects = require('../js/db.js').objects;

describe('Objects', function(){

    describe('GET /objects', function(){

        it('should return a status of 200', function *(){
            yield request.get('/objects').expect(200);
        });
    });

});