var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var articles = require('../js/db.js').articles;

describe('Articles', function(){

    describe('GET /articles', function(){

        it('should return a status of 200', function *(){
            yield request.get('/articles').expect(200);
        });
    });

});