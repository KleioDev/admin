var supertest = require('supertest-as-promised');
var expect = require('chai').expect;
var server = require('../server.js');
var app = server.app;

request = supertest(app.callback());
var notifications = require('../js/db.js').notifications;

describe('Notifications', function(){

    describe('GET /notifications', function(){

        it('should return a status of 200', function *(){
            yield request.get('/notifications').expect(200);
        });
    });

});