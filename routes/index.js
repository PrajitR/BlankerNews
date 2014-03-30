var passport = require('passport');
var Account = require('../models/account');

module.exports = function routes (app) {

  app.get('/', function (req, res) {
    res.render('index', { user: req.user });
  });

  app.get('/register', function (req, res) {
    res.render('register');
  });

  app.post('/register', function (req, res) {
    Account.register(new Account({ username: req.body.username }), 
      req.body.password, function (err, account) {
        if (err) {
          return res.render('register', {info: "Sorry, that username is taken. Pick another."});
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
      });
  });

  app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
  });

  app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
   function (req, res) {
    res.redirect('/');
  });

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

};
