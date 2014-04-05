var Story = require('../models/story'),
    Account = require('../models/account');

module.exports = function storyRoutes (app) {

  app.get('/story/:storyid', function (req, res) {
    var storyid = req.params.storyid;
    Story.findOne({ storyId: storyid }, function (error, story) {
      if (error) return res.redirect('/');

      res.render('story', { 
        story: story, 
        submitComment: '/story/' + storyid + '/comment',
        user: req.user
      });
    });
  });

  app.post('/story/:storyid/comment', function (req, res) {
    if (!req.user) return res.redirect('/login');

    var comment = req.body.comment,
        username = req.user.username,
        storyid = req.params.storyid,
        parentPath = req.body.parentPath || '';
    if (!comment) return res.redirect('/story/' + storyid);
    
    Story.findOne({ storyId: storyid }, function (error, story) {
      if (error) return res.redirect('/story/' + storyid);
      
      var index = findParentIndex(story.comments, parentPath);
      story.comments.splice(index + 1, 0, { 
        submitter: username, comment: comment,
        id: commentId(comment, username, parentPath), parentPath: parentPath
      });
      story.save(function (error) {
        if (error) console.error(error);
        addCommentToUser(username, comment, storyid, story.title, res);
      });
    });
  });

  function findParentIndex (comments, parentPath) {
    var pp = parentPath.split('/'),
        parent = pp[pp.length - 1];

    var i = 0;
    for(; i < comments.length; i++) {
      if (comments[i].id === parent)
        break;
    }
    return i;
  }

  function addCommentToUser (username, comment, storyid, title, res) {
    Account.findOne({ username: username }, function (error, user) {
      user.comments.push({
        comment: comment, url: '/story/' + storyid, title: title
      });
      user.save(function (error) {
        if (error) console.error(error);
        res.redirect('/story/' + storyid);
      });
    });
  }

  function commentId (comment, username, parentPath) {
    var date = Date.now();
    var md5 = require('crypto').createHash('md5');
    md5.update(comment + username + parentPath + date);
    var digest = md5.digest('hex'),
        digLen = 5;
    return digest.slice(digest.length - digLen);
  }


  app.get('/story/:storyid/:vote', function (req, res) {
    if (!req.user) return res.end();

    var storyid = req.params.storyid,
        vote = req.params.vote,
        user = req.user.username;

    if (vote != 'downvote' && vote != 'upvote') return res.end();

    Story.findOne({ storyId: storyid }, function (error, story) {
      if (error) return res.end(error);
      if (story.votedUsers.indexOf(user) >= 0) return res.end();

      story[vote] += 1;
      story.votedUsers.push(user);
      story.save(function (error) {
        res.end();
      });
    });
  });


  app.get('/story/:storyid/comment/:commentid/:vote', function (req, res) {
    if (!req.user) return res.end();

    var storyid = req.params.storyid,
        vote = req.params.vote,
        commentid = req.params.commentid,
        user = req.user.username;

    Story.findOne({ storyId: storyid }, function (error, story) {
      if (error) return res.end();

      var comment = null;
      for (var i = 0; i < story.comments.length; i++) {
        if (story.comments[i].id === commentid) {
          comment = story.comments[i];
          break;
        }
      }
      if (!comment) return res.end();
      if (comment.votedUsers.indexOf(user) >= 0) return res.end();
      comment[vote] += 1;
      comment.votedUsers.push(user);
      story.save(function (error) {
        res.end();
      });
    });
  });

};
