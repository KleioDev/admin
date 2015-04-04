var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var exhibitions = require('../js/db.js').exhibitions;

describe('Exhibitions', function(){

    describe('GET /exhibitions', function(){

        it('should return a status of 200', function *(){
            yield request.get('/exhibitions').expect(200);
        });
    });

});