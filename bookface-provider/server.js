(function () {
  "use strict";

  var connect = require('connect')
    , path = require('path')
    , api = require('./lib/api')
    , app
    ;

  app = connect.createServer();
  app.use(connect.favicon(path.join(__dirname, 'favicon.ico')));
  app.use(connect.static(path.join(__dirname, 'static')));
  app.use(connect.static(path.join(__dirname, 'public')));
  app.use(api);

  module.exports = app;
}());
