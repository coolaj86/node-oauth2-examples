(function () {
  "use strict";

  var $ = require('jQuery')
    ;

  function run() {
    $('.js-login').hide();

    if (/login/.test(location.hash)) {
      // get the next_url
      $('.js-login').show();
    }

    $('body').delegate('submit', 'js-login form', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      
      console.log('attempted submit');
    });
  }

  $(run);
}());
