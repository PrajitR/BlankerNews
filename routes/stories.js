var Story = require('../models/story');

module.exports = function storyRoutes (app) {

  app.get('/story/:storyid', function (req, res) {
    var storyid = req.params.storyid;
    Story.findOne({ storyId: storyid }, function (error, story) {
      if (error) return res.redirect('/');
      res.render('story', { story: story, submitComment: '/story/' + storyid + '/comment' });
    });
  });

  app.post('/story/:storyid/comment', function (req, res) {
    if (!req.user) return res.redirect('/login');

    var comment = req.body.comment,
        storyid = req.params.storyid;
    if (!comment) return res.redirect('/story/' + storyid);
    
    Story.findOne({ storyId: storyid }, function (error, story) {
      if (error) return res.redirect('/story/' + storyid);
      story.comments.push(comment);
      story.save(function (error) {
        console.error(error);
        res.redirect('/story/' + storyid);
      });
    });
  });
};
