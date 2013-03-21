(function () {
  "use strict";
  // simple server with a protected resource at /secret secured by OAuth 2

  var OAuth2Provider
    , connect = require('connect')
    , url = require('url')
    , MemoryStore = connect.session.MemoryStore
    , myClients
    , myGrants
    , myOAP
    , app
    ;

  function escape_entities(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (!connect.router) {
    connect.router = require('connect_router');
  }
  // this must get called after connect.router is added back
  OAuth2Provider = require('oauth2-provider').OAuth2Provider;

  // hardcoded list of <client id, client secret> tuples
  myClients = {
   '1': '1secret',
  };

  // temporary grant storage
  myGrants = {};

  myOAP = new OAuth2Provider('encryption secret', 'signing secret');

  // before showing authorization page, make sure the user is logged in
  myOAP.on('enforce_login', function(req, res, authorize_url, next) {
    //console.log('[enforce_login] session:', req.session);
    console.log('[enforce_login] user:', req.session.user);
    if(req.session.user) {
      next(req.session.user);
      return;
    }

    //console.log('enforce_login:', authorize_url);
    req.session.nextUrl = authorize_url;
    res.writeHead(303, { Location: '/#login' });
    //res.writeHead(303, { Location: '/#login?next=' + encodeURIComponent(authorize_url) });
    res.end();
  });

  // render the authorize form with the submission URL
  // use two submit buttons named "allow" and "deny" for the user's choice
  // those values are hard-coded somewhere
  myOAP.on('authorize_form', function(req, res, client_id, authorize_url) {
    var urlObj
      ;

    //console.log('has scope?', req.url);
    urlObj = url.parse(req.url, true);

    req.session.nextUrl = authorize_url;

    res.statusCode = 303;
    res.setHeader('Location', '/#authorize'
      + '?clientId=' + client_id
      + '&authorizeUrl=' + encodeURIComponent(authorize_url)
    );
    /*
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.write(JSON.stringify({
        clientId: client_id
      , authorizeUrl: authorize_url
    }));
    */
    res.end();
  });

  // save the generated grant code for the current user
  myOAP.on('save_grant', function(req, client_id, code, next) {
    if(!(req.session.user in myGrants)) {
      myGrants[req.session.user] = {};
    }

    myGrants[req.session.user][client_id] = code;
    next();
  });

  // remove the grant when the access token has been sent
  myOAP.on('remove_grant', function(user_id, client_id, code) {
    if(myGrants[user_id] && myGrants[user_id][client_id]) {
      delete myGrants[user_id][client_id];
    }
  });

  // find the user for a particular grant
  myOAP.on('lookup_grant', function(client_id, client_secret, code, next) {
    var user
      , clients
      ;

    // verify that client id/secret pair are valid
    if(client_id in myClients && myClients[client_id] == client_secret) {
      for(user in myGrants) {
        clients = myGrants[user];

        if(clients[client_id] && clients[client_id] == code) {
          return next(null, user);
        }
      }
    }

    next(new Error('no such grant found'));
  });

  // embed an opaque value in the generated access token
  myOAP.on('create_access_token', function(user_id, client_id, next) {
    var data = {
      "github_login_attempt_failed": false
    }; // can be any data type or null

    next(data);
  });

  // an access token was received in a URL query string parameter or HTTP header
  myOAP.on('access_token', function(req, token, next) {
    var TOKEN_TTL = 10 * 60 * 1000; // 10 minutes

    if(token.grant_date.getTime() + TOKEN_TTL > Date.now()) {
      console.log(token.user_id);
      req.session.user = token.user_id;
      req.session.data = token.extra_data;
    } else {
      console.warn('access token for user %s has expired', token.user_id);
    }

    next();
  });

  function router(rest) {
    rest.get('/status', function(req, res) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.write(JSON.stringify({ loggedIn: !!req.session.user }));
      res.end();
    });

    // this used to write out a form that had
    // 'allow' and 'deny' as options and 'next' as a parameter
    rest.get('/login', function(req, res) {
      if(req.session.user) {
        res.writeHead(303, { Location: '/' });
        return res.end();
      }

      var next_url = req.query.next ? req.query.next : '/';

      res.end(next_url);
    });

    // this used to redirects the post to the "next" url
    // which will then respond
    rest.post('/login', function(req, res) {
      var nextUrl = req.session.nextUrl || req.body.next || ''
        ;

      console.log('at /login');
      // TODO actually authenticate
      req.session.user = req.body.username;
      console.log('nextUrl:', req.session.nextUrl);

      // Form Data
      // either deny= or allow=
      if (nextUrl) {
        res.statusCode = 303;
        res.setHeader('Location', nextUrl);
        res.end();
        return;
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.write(JSON.stringify({ success: true }));
      //res.setHeader('Content-Type', 'application/json; charset=utf-8');
      //res.wirte(JSON.stringify({ nextUrl: nextUrl }));
      res.end();
    });

    rest.get('/logout', function(req, res) {
      console.log('at /logout');
      req.session.destroy(function (err) {
        if (err) {
          // nothing yet
        }
        res.writeHead(303, { Location: '/' });
        res.end();
      });
    });

    rest.get('/secret', function(req, res) {
      console.log('at /secret');
      if(req.session.user) {
        res.end(
            '<html>'
          + '<body style="background-color: #DDFFDD;">'
          + 'proceed to secret lair, extra data: ' + JSON.stringify(req.session.data)
        );
      } else {
        res.writeHead(403);
        res.end(
            '<html>'
          + '<body style="background-color: #DDFFDD;">'
          + 'no'
        );
      }
    });
  }

  function sessionDemo(req, res, next) {
    var sess = req.session;
    if (sess.views) {
      res.setHeader('Content-Type', 'text/html');
      res.write('<p>user: ' + sess.user + '</p>');
      res.write('<p>views: ' + sess.views + '</p>');
      res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
      res.end();
      sess.views += 1;
    } else {
      sess.views = 1;
      res.end(
          '<html>'
        + '<body style="background-color: #DDFFDD;">'
        + 'welcome to the session demo. refresh!'
      );
    }
  }

  app = connect.createServer()
    //.use(connect.logger())
    .use(connect.json())
    .use(connect.urlencoded())
    .use(connect.query())
    .use(connect.cookieParser('keyboard cat'))
    .use(connect.session({ cookie: { maxAge: 120 * 1000 }}))
    //.use(connect.session({store: new MemoryStore({reapInterval: 5 * 60 * 1000}), secret: 'abracadabra'}))
    .use(myOAP.oauth())
    .use(myOAP.login())
    .use(connect.router(router))
    .use('/session-demo', sessionDemo)
  ;

  module.exports = app;
}());
