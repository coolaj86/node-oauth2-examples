/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
/*
 * SERVER
 */
(function () {
  "use strict";

  var connect = require('steve')
    , app = connect()
    ;

  connect.router = require('connect_router');

  function getHello(request, response) {
    response.json(request.params);
    response.end();
  }

  function router(rest) {
    rest.get('/hello/:name?', getHello);
  }

  app.use(connect.favicon());
  app.use(connect.static(__dirname + '/../../webclient-deployed'));
  app.use(connect.router(router));

  module.exports = app;
}());
