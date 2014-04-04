var should = require('should'),
    request = require('supertest'),
    Account = require('../models/account'),
    Story = require('../models/story'),
    app = require('./app');

describe('Stories', function () {
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

  describe('Commenting', function () {
    var storyUrl;

    before(function (done) {
      r
        .post('/register')
        .send({ username: 'a', password: 'a' })
        .expect(302)
        .end(done);
    });

    before(function (done) {
      r
        .post('/login')
        .send({ username: 'a', password: 'a' })
        .end(done);
    });

    before(function (done) {
      r
        .post('/submit')
        .send({ url: 'http://prajitr.github.io', title: 'Cool' })
        .end(function (err, res) {
          storyUrl = res.header['location'];
          done();
        });
    });


    it('should allow you to post a comment', function (done) {
      r
        .post(storyUrl + '/comment')
        .send({ comment: 'first comment' })
        .expect(302)
        .end(function (err, res) {
          res.header['location'].should.equal(storyUrl);
          done();
        });
    });

    it('should display the comment', function (done) {
      r
        .get(storyUrl)
        .expect(function (res) {
          res.text.should.match(/first comment/);
        })
        .end(done);
    });

    it('should allow you to reply to a comment', function (done) {
      Story.findOne({ url: 'http://prajitr.github.io' }, function (err, story) {
        if (err) console.error(err);

        var path = '/' + story.comments[0].id;
        r
          .post(storyUrl + '/comment')
          .send({ comment: 'second comment', parentPath: path }) 
          .expect(302)
          .end(function (err, res) {
            res.header['location'].should.equal(storyUrl);
            done();
          });
      });
    });

    it('should be in order', function (done) {
      r
        .get(storyUrl)
        .expect(function (res) {
          res.text.should.match(/(first comment).*(second comment)/);
        })
        .end(done);
    });
  });
});
        

