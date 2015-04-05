var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;
var comocha = require("co-mocha");

request = supertest(app.callback());
var administrators = require('../js/db.js').users;

describe('Administrators', function(){

    describe('GET /administrators', function(){

        it('should return a status of 200', function *(){
            yield request.get('/administrators').expect(200);
        });
    });

    describe('GET /edit_admin/1', function(){

        it('should return a status of 200', function *(){
            yield request.get('/edit_admin/1').expect(200);
        });
    });
    describe('GET /edit_admin/2', function(){

        it('should return a status of 404', function *(){
            yield request.get('/edit_admin/2').expect(404);
        });
    });

});