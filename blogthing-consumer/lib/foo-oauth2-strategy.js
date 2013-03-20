/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
(function () {
  "use strict";

  var OAuth = require("oauth").OAuth2
    , url = require("url")
    ;

  module.exports = function (options, server) {
    options = options || {};

    var that = {}
      , my = {}
      , moduleName = options.name || 'foo'
      , authCallback = '/_oauth/_' + moduleName + '_callback'
      , sessionAuthFailed = moduleName + '_login_attempt_failed'
      , sessionRedirectUrl = moduleName + '_redirect_url'
      , callbackUrlObj
      ;

    // http://localhost:7788/
    //options.callback = authCallback;
    //callbackUrlObj = url.parse(options.callback);
    //authCallback = callbackUrlObj.pathname;
    console.log(authCallback);

    // Give the strategy a name
    that.name = moduleName;

    // Build the authentication routes required
    that.setupRoutes = function (app) {
      app.use(authCallback, function (req, res) {
        req.authenticate([that.name], function (error, authenticated) {
          console.log('req.session.sessionRedirectUrl', req.session.sessionRedirectUrl);
          res.writeHead(303, {
            'Location': req.session.sessionRedirectUrl
          });
          res.end(
              ''
          );
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

    //my._redirectUri = options.callback;
    my.scope = options.scope || "";

    // Declare the method that actually does the authentication
    that.authenticate = function (request, response, callback) {
      //todo: makw the call timeout ....

      console.log('looking at that.authenticate', request.originalUrl, request.url);

      var protocol = 'http' + (request.connection.encrypted ? 's' : '') + '://'
        , host = request.headers.host
        , parsedUrl = url.parse(request.originalUrl, true)
        , self = this
        , redirectUrl
        ;

      my._redirectUri = protocol + host + authCallback;
      console.log(my._redirectUri);

      function verifyAuthSuccess(error, data, response) {
        if (error) {
          console.errror('[ERR]', 'verifyAuthSuccess:', error);
        } else if (data) {
          console.log('verifyAuthSuccess:', JSON.stringify(data), !!response);
        } else {
          console.log('supposedly unreachable code: dripping in lamesauce...');
        }

        /*
        if (error) {
          request.getAuthDetails().sessionAuthFailed = true;
          self.fail(callback);
        } else {
          self.success(JSON.parse(data).user, callback);
        }
        */
        self.success("some arbitrary data", callback);
      }

      function storeTokensInSession(error, access_token, refresh_token) {
        if (error) {
          callback(error);
          return;
        }

        request.session.access_token = access_token;

        if (refresh_token) {
          request.session.refresh_token = refresh_token;
        }

        my._oAuth.getProtectedResource(
            "http://localhost:4455/secret"
            //"https://github.com/api/v2/json/user/show"
          , request.session.access_token
          , verifyAuthSuccess
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

      request.session.sessionRedirectUrl = options.callback;

      if (parsedUrl.query && parsedUrl.query.code) {
        my._oAuth.getOAuthAccessToken(
            parsedUrl.query.code
          , {
                redirect_uri: my._redirectUri
            }
          , storeTokensInSession
        );
        return;
      }

      if (parsedUrl.query && parsedUrl.query.error) {
        request.getAuthDetails().sessionAuthFailed = true;
        self.fail(callback);
        return;
      }

      console.log('assigning req.session.sessionRedirectUrl', request.originalUrl);
      request.session.sessionRedirectUrl = request.originalUrl;

      redirectUrl = my._oAuth.getAuthorizeUrl({
        redirect_uri: my._redirectUri,
        scope: my.scope
      });
      console.log('getAuthorizeUrl', redirectUrl);

      self.redirect(response, redirectUrl, callback);
    };

    return that;
  };

}());
