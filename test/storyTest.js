var should = require('should'),
    request = require('supertest'),
    Account = require('../models/account'),
    Story = require('../models/story'),
    app = require('./app');

describe('Stories', function () {
  var r, storyUrl;

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
        .send({ url: 'http://prajitr.github.io', title: 'TheTitle' })
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

    it('should not allow submitting comments when logged out', function (done) {
      r
        .get('/logout')
        .end(function (err, res) {
          Story.findOne({ url: 'http://prajitr.github.io' }, function (err, story) {
            if (err) console.error(err);

            var path = '/' + story.comments[0].id;
            r
              .post(storyUrl + '/comment')
              .send({ comment: 'second comment', parentPath: path }) 
              .expect(302)
              .end(function (err, res) {
                res.header['location'].should.equal('/login');
                done();
              });
            });
        });
    });
  });

  describe('Voting', function () {
    beforeEach(function (done) {
      r
        .post('/login')
        .send({ username: 'a', password: 'a' })
        .end(done);
    });

    describe('Stories', function () {
      describe('logged out', function () {
        before(function (done) {
          r
            .get('/logout')
            .end(done);
        });

        it('should not change upvotes', function (done) {
          r
            .get(storyUrl + '/upvote')
            .end(function (err, res) {
              Story.findOne({ title: 'TheTitle' }, function (err, story) {
                story.upvote.should.equal(1);
                done();
              });
            });
        });

        it('should not change downvotes', function (done) {
          r
            .get(storyUrl + '/downvote')
            .end(function (err, res) {
              Story.findOne({ title: 'TheTitle' }, function (err, story) {
                story.downvote.should.equal(1);
                done();
              });
            });
        });

        after(function (done) {
          r
            .post('/login')
            .send({ username: 'a', password: 'a' })
            .end(done);
        });
      });

      it('should allow you to upvote', function (done) {
        r
          .get(storyUrl + '/upvote')
          .end(function (err, res) {
            Story.findOne({ title: 'TheTitle' }, function (err, story) {
              story.upvote.should.equal(1);
              done();
            });
          });
      });

      it('should not allow a second upvote', function (done) {
        r
          .get(storyUrl + '/upvote')
          .end(function (err, res) {
            Story.findOne({ title: 'TheTitle' }, function (err, story) {
              story.upvote.should.equal(1);
              done();
            });
          });
      });

      it('should allow you to downvote', function (done) {
        Story.findOne({ title: 'TheTitle' }, function (err, story) {
          story.votedUsers = [];
          story.save(function (err) {
           r
            .get(storyUrl + '/downvote')
            .end(function (err, res) {
              Story.findOne({ title: 'TheTitle' }, function (err, story) {
                story.downvote.should.equal(1);
                done();
              });
            });

          });
        });
      });

      it('should not allow a second downvote', function (done) {
        r
          .get(storyUrl + '/downvote')
          .end(function (err, res) {
            Story.findOne({ title: 'TheTitle' }, function (err, story) {
              story.downvote.should.equal(1);
              done();
            });
          });
      });
    });

    describe('Comments', function () {
      var commentid;
      before(function (done) {
        Story.findOne({ title: 'TheTitle' }, function (err, story) {
          commentid = story.comments[0].id;
          done();
        });
      });
     
      describe('logged out', function () {
        before(function (done) {
          r
            .get('/logout')
            .end(done);
        });

        it('should not change upvotes', function (done) {
          r
            .get(storyUrl + '/comment/' + commentid + '/upvote')
            .end(function (err, res) { 
              Story.findOne({ title: 'TheTitle' }, function (err, story) {
                story.comments[0].upvote.should.equal(1);
                done();
              });
          });
        });

        it('should not change downvotes', function (done) {
          r
            .get(storyUrl + '/comment/' + commentid + '/downvote')
            .end(function (err, res) { 
              Story.findOne({ title: 'TheTitle' }, function (err, story) {
                story.comments[0].downvote.should.equal(1);
                done();
              });
          });
        });

        after(function (done) {
          r
            .post('/login')
            .send({ username: 'a', password: 'a' })
            .end(done);
        });
      });

      it('should allow you to upvote', function (done) {
        r
          .get(storyUrl + '/comment/' + commentid + '/upvote')
          .end(function (err, res) { 
            Story.findOne({ title: 'TheTitle' }, function (err, story) {
              story.comments[0].upvote.should.equal(1);
              done();
            });
          });
      });
  
      it('should not allow a second upvote', function (done) {
        r
          .get(storyUrl + '/comment/' + commentid + '/upvote')
          .end(function (err, res) { 
            Story.findOne({ title: 'TheTitle' }, function (err, story) {
              story.comments[0].upvote.should.equal(1);
              done();
            });
          });
      });


      it('should allow you to downvote', function (done) {
        Story.findOne({ title: 'TheTitle' }, function (err, story) {
          story.comments[0].votedUsers = [];
          story.save(function (err) {
            r
            .get(storyUrl + '/comment/' + commentid + '/downvote')
            .end(function (err, res) { 
              Story.findOne({ title: 'TheTitle' }, function (err, story) {
                story.comments[0].downvote.should.equal(1);
                done();
              });
            });
          });
        });
      });

      it('should not allow a second downvote', function (done) {
        r
          .get(storyUrl + '/comment/' + commentid + '/downvote')
          .end(function (err, res) { 
          Story.findOne({ title: 'TheTitle' }, function (err, story) {
            story.comments[0].downvote.should.equal(1);
            done();
          });
        });
      });
    });
  });
});
        

