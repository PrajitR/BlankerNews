var should = require('should');
var mongoose = require('mongoose');
var request = require('supertest');
var Account = require('../models/account');
var Story = require('../models/story');
var app = require('../app')('test');

describe('Routes', function () {
  var r;

  before(function (done) {
    r = request.agent(app);
    done();
  });

  after(function (done) {
    Account.remove({}, function(err, accs) {
      Story.remove({}, done);
    });
  });

  describe('Registration', function () {
    it('should register successfull and redirect to main page', function (done) {
      r
        .post('/register')
        .send({ username: 'ned_stark', password: 'ice' })
        .expect(302)
        .end(function (err, res) {
          res.header['location'].should.equal('/');  
          done();
        });
    });

    it('should contain the username on home page', function (done) {
      r
        .get('/')
        .expect(200)
        .expect(/ned_stark/)
        .end(done);
    });

    it('should prevent usernames that have already been taken', function (done) {
      r
        .post('/register')
        .send({ username: 'ned_stark', password: 'pleasefail' })
        .expect(/username is taken/)
        .end(done);
    });
  });

  describe('Logout', function () {
    it('should logout', function (done) {
      r
        .get('/logout')
        .expect(302)
        .end(function (err, res) {
          res.header['location'].should.equal('/');  
          done();
        });
    });

    it('should not contain username on main page', function (done) {
      r
        .get('/')
        .expect(function (res) {
          res.text.should.not.match(/ned_stark/);
         })
        .end(done);
    });
  });

  describe('Login', function () {
    it('should login', function (done) {
      r
        .post('/login')
        .send({ username: 'ned_stark', password: 'ice' })
        .expect(302)
        .end(function (err, res) {
          res.header['location'].should.equal('/');  
          done();
        });
    });

    it('should contain the username on home page', function (done) {
      r
        .get('/')
        .expect(200)
        .expect(/ned_stark/)
        .end(done);
    });
  });

  describe('Submit story', function () {

    describe('submit stories when logged in', function () {
      before(function (done) {
        r
          .post('/login')
          .send({ username: 'ned_stark', password: 'ice' })
          .end(done);
      });

      it('should submit a story with a title and url', function (done) {
        r
          .post('/submit')
          .send({ url: 'http://prajitr.github.io', title: 'Amazing blog!!!!' })
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.match(/\/story\/.+/);
            done();
          });
      });

      it('should submit a story with a title and text', function (done) {
        r
          .post('/submit')
          .send({ text: 'Winter is coming', title: 'Amazing blog!!!!' })
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.match(/\/story\/.+/);
            done();
          });
      });

      it('should not allow duplicate urls', function (done) {
        r
          .post('/submit')
          .send({ url: 'http://prajitr.github.io', title: 'Did you know this guy rocks?' })
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.equal('/submit');
            done();
          });
      });

      it('should not allow stories without titles', function (done) {
        r
          .post('/submit')
          .send({ url: 'http://prajitr.github.io', title: 'This shouldnt work' })
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.equal('/submit');
            done();
          });
      });

      it('should not allow stories without urls and text', function (done) {
        r
          .post('/submit')
          .send({ title: 'This shouldnt work' })
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.equal('/submit');
            done();
          });
      });
    });

    describe('submit stories without logging in', function () {
      before(function (done) {
        r.get('/logout').end(done);
      });

      it('should not allow get requests', function (done) {
        r
          .get('/submit')
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.equal('/login');
            done();
          });
      });

      it('should not allow post requests', function (done) {
        r
          .post('/submit')
          .send({ url: 'http://google.com', title: 'Shouldnt work' })
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.equal('/login');
            done();
          });
      });
    });

  });
});
