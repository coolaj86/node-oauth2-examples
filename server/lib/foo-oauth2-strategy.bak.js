/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
(function () {
  "use strict";
  
  var OAuth= require("oauth").OAuth2
    , url = require("url")
    , http = require('http')
    ;

  module.exports= function (options, server) {
    options= options || {};
    options.callback = '/auth/fooauth_callback';

    var that= {}
      , my = {}
      , sessionAuthKey
      , sessionRedirectUrl
      ;

    // Give the strategy a name
    that.name  = options.name || "foo" || "github";
    sessionAuthKey = that.name + '_login_attempt_failed';
    sessionRedirectUrl = that.name + '_redirect_url';

    function onAuthResponse(req, res) {
      req.authenticate([that.name], function(error, authenticated) {
        res.writeHead(303, { 'Location': req.session.sessionRedirectUrl });
        res.end('');
      });
    }

    // Build the authentication routes required
    that.setupRoutes = function (app) {
      console.log(options.callback);
      app.use(options.callback, onAuthResponse);
    };

    // Construct the internal OAuth client
    my._oAuth= new OAuth(
        options.appId
      , options.appSecret
      //, "https://github.com/"
      , "http://localhost:4455/"
      , "oauth/authorize"
      //, "login/oauth/authorize"
      , "oauth/access_token"
      //, "login/oauth/access_token"
    );
    my._redirectUri = options.callback;
    my.scope= options.scope || "";

    // Declare the method that actually does the authentication
    that.authenticate= function(request, response, callback) {
      //todo: makw the call timeout ....
      var parsedUrl = url.parse(request.originalUrl, true)
        , self = this
        , redirectUrl
        ;

      function doThingThing(error, access_token, refresh_token) {

        function doInnerThing(error, data, response) {
          if( error ) {
            request.getAuthDetails().sessionAuthKey = true;
            self.fail(callback);
          } else {
            self.success(JSON.parse(data).user, callback);
          }
        }

        if(error) {
          callback(error);
          return;
        }

        request.session.access_token = access_token;

        if( refresh_token ) {
          request.session.refresh_token = refresh_token;
        }

        my._oAuth.getProtectedResource(
            "https://github.com/api/v2/json/user/show"
          , request.session.access_token
          , doInnerThing
        );
      }

      if (request.getAuthDetails().sessionAuthKey === true) {
        // Because we bounce through authentication calls across multiple requests
        // we use this to keep track of the fact we *Really* have failed to authenticate
        // so that we don't keep re-trying to authenticate forever.
        // (To clarify this infinite retry that we're stopping here would only
        //  occur when the attempt has failed, not when it has succeeded!!!)
        delete request.getAuthDetails().sessionAuthKey;
        self.fail( callback );
        return;
      }

      if (parsedUrl.query && parsedUrl.query.code) {
        my._oAuth.getOAuthAccessToken(
            parsedUrl.query.code
          , {
                redirect_uri: my._redirectUri
            }
          , doThingThing
        );
      } else if( parsedUrl.query && parsedUrl.query.error ) {
        request.getAuthDetails().sessionAuthKey = true;
        self.fail(callback);
      } else {
        request.session.sessionRedirectUrl= request.originalUrl;
        redirectUrl= my._oAuth.getAuthorizeUrl({redirect_uri : my._redirectUri, scope: my.scope });
        self.redirect(response, redirectUrl, callback);
      }
    };

    return that;
  };
}());
