#!/usr/bin/env node
/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true*/
(function () {
  "use strict";

  var spawn = require('child_process').spawn
    , util = require('util')
    , deploy
    ;

  if (/^win/.exec(process.platform)) {
    console.log(process.platform);
    process.exit(1);
  }

  deploy = spawn('bash', ['./bin/deploy.sh']);
  deploy.stdout.on('data', function (data) {
    util.print(data.toString('utf8'));
  });
  deploy.stderr.on('data', function (data) {
    util.print(data.toString('utf8'));
  });
  deploy.on('exit', function (code) {
    process.exit(code);
  });
}());
