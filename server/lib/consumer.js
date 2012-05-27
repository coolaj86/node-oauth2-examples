/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  var connect = require('connect')
    , fooStrategy = require('./foo-oauth2-strategy')
    , auth = require('connect-auth')
    , url = require('url')
    , authOptions
    , fooStrategyOptions
    , app
    ;

  // GET http://localhost:7788/login
  function fooAuth(req, res, next) {
    console.log('looking at /login');

    function logAuthentication(error, authenticated) {
      if (error) {
        // Something has gone awry, behave as you wish.
        console.error(error);
        res.end();
        return;
      }

      if (undefined === authenticated) {
        // The authentication strategy requires some more browser interaction, suggest you do nothing here!
        console.log('stuck in the weird state?');
        return;
      }

      // We've either failed to authenticate, or succeeded (req.isAuthenticated() will confirm, as will the value of the received argument)
      next();
    }

    req.authenticate(['foo'], logAuthentication);
  }

  function logoutRoute(req, res, params) {
    console.log('looking at /logout');
    req.logout(); // Using the 'event' model to do a redirect on logout.
  }

  function homeRoute(req, res, params) {
    console.log('looking at /', req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});

    if (req.isAuthenticated()) {
      res.end('Authenticated: ' + JSON.stringify(req.getAuthDetails().user));
      return;
    }

    res.end('Not Authenticated');
  }

  function redirectOnLogout(redirectUrl) {

    function handler(authContext, loggedOutUser, callback) {
      authContext.response.writeHead(303, { 'Location': redirectUrl });
      authContext.response.end('looking at redirectOnLogout');

      if (callback) {
        callback();
      }
    }

    return handler;
  }

  fooStrategyOptions = {
      appId: "1" // 1
    , appSecret: "1secret" // 1secret
    , callback: "http://localhost:7788/auth/fooauth_callback"  // http://yourtesthost.com/auth/github_callback
  };

  authOptions = {
      strategies: [
          fooStrategy(fooStrategyOptions)
      ]
    , trace: true
    , logoutHandler: redirectOnLogout("/")
  };

  app = connect()
    .use(connect.favicon())
    .use(connect.cookieParser("keybored dog"))
    .use(connect.session())
    .use(connect.json())
    .use(connect.urlencoded())
    .use(auth(authOptions))
    .use("/login", fooAuth)
    .use('/logout', logoutRoute)      
    .use("/", homeRoute)
  ;

  module.exports = app;
}());
