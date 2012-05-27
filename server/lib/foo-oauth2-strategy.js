/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
(function () {
  "use strict";

  var OAuth = require("oauth").OAuth2
    , url = require("url")
    , http = require('http')
    ;

  module.exports = function (options, server) {
    options = options || {};

    var that = {}
      , my = {}
      , moduleName = options.name || 'foo'
      , authCallback = '/auth/' + moduleName + '_callback'
      , sessionAuthFailed = moduleName + '_login_attempt_failed'
      , sessionRedirectUrl = moduleName + '_redirect_url'
      ;

    options.callback = authCallback;

    // Give the strategy a name
    that.name = moduleName;

    // Build the authentication routes required
    that.setupRoutes = function (app) {
      app.use(authCallback, function (req, res) {
        req.authenticate([that.name], function (error, authenticated) {
          res.writeHead(303, {
            'Location': req.session.sessionRedirectUrl
          });
          res.end('');
        });
      });
    };

    // Construct the internal OAuth client
    my._oAuth = new OAuth(
        options.appId
      , options.appSecret
      , "http://localhost:4455/"
      //, "https://github.com/"
      , "oauth/authorize"
      //, "login/oauth/authorize"
      , "oauth/access_token"
      //, "login/oauth/access_token"
    );

    my._redirectUri = options.callback;
    my.scope = options.scope || "";

    // Declare the method that actually does the authentication
    that.authenticate = function (request, response, callback) {
      console.log('looking at that.authenticate', request.originalUrl, request.url);
      //todo: makw the call timeout ....
      var parsedUrl = url.parse(request.originalUrl, true)
        , self = this
        , redirectUrl
        ;

      function doThing(error, data, response) {
        if (error) {
          request.getAuthDetails().sessionAuthFailed = true;
          self.fail(callback);
        } else {
          self.success(JSON.parse(data).user, callback);
        }
      }

      function doOtherThing(error, access_token, refresh_token) {
        if (error) {
          callback(error);
          return;
        }

        request.session.access_token = access_token;

        if (refresh_token) {
          request.session.refresh_token = refresh_token;
        }

        my._oAuth.getProtectedResource(
            "https://github.com/api/v2/json/user/show"
          , request.session.access_token
          , doThing
        );
      }

      if (true === request.getAuthDetails().sessionAuthFailed) {
        // Because we bounce through authentication calls across multiple requests
        // we use this to keep track of the fact we *Really* have failed to authenticate
        // so that we don't keep re-trying to authenticate forever.
        // (To clarify this infinite retry that we're stopping here would only
        //  occur when the attempt has failed, not when it has succeeded!!!)
        delete request.getAuthDetails().sessionAuthFailed;
        self.fail(callback);
        return;
      }

      if (parsedUrl.query && parsedUrl.query.code) {
        my._oAuth.getOAuthAccessToken(
            parsedUrl.query.code
          , {
                redirect_uri: my._redirectUri
            }
          , doOtherThing
        );
        return;
      }

      if (parsedUrl.query && parsedUrl.query.error) {
        request.getAuthDetails().sessionAuthFailed = true;
        self.fail(callback);
        return;
      }

      request.session.sessionRedirectUrl = request.originalUrl;
      redirectUrl = my._oAuth.getAuthorizeUrl({
        redirect_uri: my._redirectUri,
        scope: my.scope
      });

      self.redirect(response, redirectUrl, callback);
    };

    return that;
  };

}());
