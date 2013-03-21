(function () {
  "use strict";

  var connect = require('connect')
    , path = require('path')
    , fooStrategy = require('./foo-oauth2-strategy')
    , auth = require('connect-auth')
    , authOptions
    , fooStrategyOptions
    , app
    ;

  // GET http://localhost:7788/login
  function fooAuth(req, res, next) {
    req.session.oauthCallback = req.query.oauthCallback;
    console.log('[fooAuth] oauthCallback=', req.query.oauthCallback);

    function logAuthentication(error, authenticated) {
      if (error) {
        // Something has gone awry, behave as you wish.
        console.error(error);
        res.end();
        return;
      }

      if (undefined === authenticated) {
        // The authentication strategy requires some more browser interaction, suggest you do nothing here!
        console.log('[fooAuth] Waiting for browser interaction...');
        return;
      }

      // We've either failed to authenticate, or succeeded (req.isAuthenticated() will confirm, as will the value of the received argument)
      next();
    }

    req.authenticate(['foo'], { scope: ["email", "birthday"] }, logAuthentication);
  }

  function logoutRoute(req, res) {
    console.log('looking at /logout');
    req.logout(); // Using the 'event' model to do a redirect on logout.
    res.end();
  }

  function statusRoute(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.write(JSON.stringify(req.getAuthDetails().user));
    res.end();
  }

  function oauthCallbackRoute(req, res) {
    console.log('looking at /', req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});

    // What the L happens to the session here?
    console.log('[oauthCallback] oauthCallback=', req.session.oauthCallback);
    if (!req.session.oauthCallback) {
      console.error('Lost the session! oauthCallback was defined, but is no longer');
    }

    res.write(
        '<html><head>'
      + '<script>window.opener.'
        + req.session.oauthCallback + '('
        + JSON.stringify(req.isAuthenticated())
        + ')</script>'
      + '</head></html>'
    );
    res.end();
  }

  function redirectOnLogout(redirectUrl) {

    function handler(authContext, loggedOutUser, callback) {
      console.log('redirectOnLogout url', redirectUrl);
      authContext.response.writeHead(303, { 'Location': redirectUrl });
      authContext.response.end(
          '<html>'
        + '<body style="background-color: #EEEEFF;">'
        + 'looking at redirectOnLogout'
      );

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
    //, trace: true
    , logoutHandler: redirectOnLogout("/")
  };

  // XXX TODO getProtectedResource /secret
  app = connect()
    .use(connect.static(path.join(__dirname, 'public')))
    .use(connect.favicon())
    .use(connect.cookieParser("keybored dog"))
    .use(connect.session())
    .use(connect.query())
    .use(connect.json())
    .use(connect.urlencoded())
    .use(auth(authOptions))
    .use("/login", fooAuth)
    .use("/logout", logoutRoute)
    .use("/status", statusRoute)
    .use("/auth/fooauth_callback", oauthCallbackRoute)
  ;

  module.exports = app;
}());
