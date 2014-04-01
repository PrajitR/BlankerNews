function createApp (db) {
  /**
   * Module dependencies.
   */

  var express = require('express');
  var routes = require('./routes');
  var storyRoutes = require('./routes/stories');
  var http = require('http');
  var path = require('path');
  var mongoose = require('mongoose');
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;

  var app = express();

  // all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('less-middleware')(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // Authentication
  var Account = require('./models/account');
  passport.use(new LocalStrategy(Account.authenticate()));
  passport.serializeUser(Account.serializeUser());
  passport.deserializeUser(Account.deserializeUser());

  // Database
  mongoose.connect('mongodb://localhost/' + db);

  // Routing
  routes(app);
  storyRoutes(app);

  var server = http.createServer(app);
  server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
  
  function cleanup () {
    server.close(function () {
      console.log('Closing MongoDB connection');
      mongoose.connection.close();
    });
  }

  process.on('SIGTERM', cleanup);

  return app;
}

module.exports = createApp;
