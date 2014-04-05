var passport = require('passport');
var Account = require('../models/account');
var Story = require('../models/story');
var crypto = require('crypto');

module.exports = function indexRoutes (app) {

  var time, prevStories;

  app.get('/', function (req, res) {
    if (shouldResort()) {
      Story.find(function (err, stories) {
        if (err) return console.error(err);
        stories.sort(function (a, b) {
          return rank(b) - rank(a);
        });
        prevStories = stories;
        res.render('index', { user: req.user, stories: stories });
      });
    } else {
      res.render('index', { user: req.user, stories: prevStories });
    }
  });

  function shouldResort () {
    var waitTime = 1000 * 60; // one minute
    if (!time || Date.now() - time > waitTime) {
      time = Date.now();
      return true;
    } else {
      return false;
    }
  }

  // taken from Evan Miller: www.evanmiller.org/how-not-to-sort-by-average-rating.html
  function rank (story) {
    var pos = story.upvote,
        n = story.upvote + story.downvote;
    if (n == 0) return 0;
    var z = 1.96, // zscore of 95% confidence interval
        phat = pos / n;
    return (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n);
  }

  app.get('/new', function (req, res) {
    Story.find(function (err, stories) {
      if (err) return console.error(err);
      stories.sort(function (a, b) {
        return b.date - a.date;
      });
      res.render('index', { user: req.user, stories: stories });
    });
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

  app.get('/submit', function (req, res) {
    if (!req.user) return res.redirect('/login');
    res.render('submit');
   });
      
  app.post('/submit', function (req, res) {
      if (!req.user) return res.redirect('/login');

      var url = req.body.url,
          title = req.body.title,
          text = req.body.text,
          storyId = createStoryId(url, title, text, req.user.username);
      
      // fail if title is not given or url and text not given
      if (!title || (!url && !text)) return res.redirect('/submit');
      redirectIfDuplicate(url, res, function createStory () {
        var story;
        if (url)
          story = new Story({ url: url, title: title, storyId: storyId,
          submitter: req.user.username });
        else
          story = new Story({ text: text, title: title, storyId: storyId,
          submitter: req.user.username });

        story.save(function (err, s) {
          if (err) return console.error(err);
          res.redirect('/story/' + story.storyId);
        });
      });
    });

  function createStoryId (url, title, text, username) {
    var date = Date.now();
    var md5 = crypto.createHash('md5');
    md5.update(url + title + text + username + date);
    var digest = md5.digest('hex');
    return digest.slice(16);
  }

  function redirectIfDuplicate (url, res, cb) {
    Story.find( { url: url }, function (err, stories) {
      if (err) console.error(err);
      if (stories.length > 0) {
        res.redirect('/submit');
      } else {
        cb();
      }
    });
  }
};
