(function () {
  "use strict";

  var $ = require('jQuery')
    ;

  function run() {
    $('body').delegate('click', 'a[href="login"]', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      
      console.log('attempted click');
    });
  }

  $(run);
}());
