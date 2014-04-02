var Account = require('../models/account');

module.exports  = function userRoutes (app) {
  app.get('/user/:username', function (req, res) {
    var username = req.params.username;
    Account.findOne({ username: username }, function (err, user) {
      if (err) return res.redirect('/');
      res.render('user', { username: username, comments: user.comments });
    });
  });
};
