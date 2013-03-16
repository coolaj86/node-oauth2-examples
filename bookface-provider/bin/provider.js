#!/usr/bin/env node
(function () {
  "use strict";

  var port = process.argv[2] || 4455
    , app = require('../server')
    ;

  function run() {
    var server
      ;

    function onListening() {
      var addr = server.address()
        ;

      console.log("Provider listening on http://%s:%d", addr.address, addr.port);
    }

    server = app.listen(port, onListening);
  }

  if (require.main === module) {
    run();
  }
}());
