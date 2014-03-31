var should = require('should');
var mongoose = require('mongoose');
var request = require('supertest');
var Account = require('../models/account');
var db;
var app = require('../app')('test');

describe('Registration', function () {
  var r;

  before(function (done) {
    r = request.agent(app);
    done();
  });

  after(function (done) {
    mongoose.connection.close();
    done();
  });

  describe('Successful Registration', function () {
    it('should redirect to main page', function (done) {
      r
        .post('/register')
        .send({ username: 'ned_stark', password: 'ice' })
        .expect(302)
        .end(done);
    });

    it('should contain the username on home page', function (done) {
      r
        .get('/')
        .expect(200)
        .expect(/ned_stark/)
        .end(done);
    });

    after(function (done) {
      Account.remove({}, done);
    });
  });
});
