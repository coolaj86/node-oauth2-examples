#!/usr/bin/env node
(function () {
  "use strict";

  var providerPort = process.argv[2] || 4455
    , consumerPort = process.argv[3] || 7788
    , appProvider = require('../bookface-provider')
    , appConsumer = require('../blogthing-consumer')
    ;

  function run() {
    var providerServer
      , consumerServer
      ;

    function onProviderListening() {
      var addr = providerServer.address()
        ;

      console.log("Provider listening on http://%s:%d", addr.address, addr.port);
    }

    function onConsumerListening() {
      var addr = consumerServer.address()
        ;

      console.log("Consumer listening on http://%s:%d", addr.address, addr.port);
    }

    providerServer = appProvider.listen(providerPort, onProviderListening);
    consumerServer = appConsumer.listen(consumerPort, onConsumerListening);
  }

  if (require.main === module) {
    run();
  }
}());
