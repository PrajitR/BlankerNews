var Story = require('../models/story');

module.exports = function storyRoutes (app) {

  app.get('/story/:storyid', function (req, res) {
    Story.findOne({ storyId: req.params.storyid }, function (error, story) {
      if (error) return res.render('/');
      res.render('story', { story: story });
    });
  });
 
};
