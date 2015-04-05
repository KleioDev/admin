var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var feedback = require('../js/db.js').feedback;

describe('Feedback', function(){

    describe('GET /feedback', function(){

        it('should return a status of 200', function *(){
            yield request.get('/feedback').expect(200);
        });
    });

});