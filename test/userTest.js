var should = require('should');
var mongoose = require('mongoose');
var Account = require('../models/account');
var db;

describe('Account', function () {
  before(function (done) {
    db = mongoose.createConnection('mongodb://localhost/test');
    done();
  });

  after(function (done) {
    mongoose.connection.close();
    done();
  });

  beforeEach(function (done) {
    var account = new Account({
      username: '12345',
      password: 'testy'
    });

    account.save(function (err) {
      if (err) console.error('Error: ' + error.message);
      done();
    });
  });

  it('find a user by username', function (done) {
    Account.findOne({ username: '12345' }, function (err, account) {
      account.username.should.equal('12345');
      done();
    });
  });

  it('should have 0 karma initially', function (done) {
    Account.findOne({ username: '12345' }, function (err, account) {
      account.karma.should.equal(0);
      done();
    });
  });

  it('should enforce username uniqueness', function (done) {
    var account2 = new Account({
      username: '12345',
      password: 'pleasefail'
    });
    account2.save(function (err) {
      err.should.be.an.Error;
      done();
    });
  });

  describe('#incKarma', function () {
    it('should increase karma by one', function (done) {
      Account.findOne({ username: '12345'}, function (err, account) {
        account.incKarma();
        account.karma.should.equal(1);
        done();
      });
    });
  });

  describe('#decKarma', function () {
    it('should decrease karma by one', function (done) {
      Account.findOne({ username: '12345'}, function (err, account) {
        account.decKarma();
        account.karma.should.equal(-1);
        done();
      });
    });
  });

  afterEach(function (done) {
    Account.remove({}, function () {
      done();
    });
  });

});
