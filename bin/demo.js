#!/usr/bin/env node
(function () {
  "use strict";

  var connect = require('connect')
    , providerPort = process.argv[2] || 4455
    , consumerPort = process.argv[3] || 7788
    , juntosPort = process.argv[2] || 80
    , appProvider = require('../bookface-provider')
    , appConsumer = require('../blogthing-consumer')
    ;

  function run(opts) {
    var providerServer
      , consumerServer
      , app
      , server
      ;

    function onProviderListening() {
      var addr = providerServer.address()
        ;

      console.log("Open your browser to Bookface Provider at http://%s:%d", addr.address, addr.port);
    }

    function onConsumerListening() {
      var addr = consumerServer.address()
        ;

      console.log("Open your browser to Blogthing Consumer at http://%s:%d", addr.address, addr.port);
    }

    function onListening() {
      console.log("Open your browser to Blogthing Consumer at http://consumer.example.net");
      console.log("Open your browser to Bookface Provider at http://provider.example.com");
    }

    if (opts.losDos) {
      providerServer = appProvider.listen(providerPort, onProviderListening);
      consumerServer = appConsumer.listen(consumerPort, onConsumerListening);
    } else {
      // something is really screwy with connect.vhost and this example
      // ... it's not working at all
      app = connect.createServer();
      app.use(connect.vhost('provider.example.com', appProvider));
      app.use(connect.vhost('consumer.example.net', appConsumer));
      app.use(function (req, res, next) {
        console.log('req.headers.host', req.headers.host);
        next();
      });
      server = app.listen(juntosPort, onListening);
    }
  }

  if (require.main === module) {
    if (true) {
      run({ losDos: true });
    } else {
      run();
    }
  }
}());
