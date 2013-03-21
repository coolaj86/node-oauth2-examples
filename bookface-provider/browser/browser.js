(function () {
  "use strict";

  var $ = require('jQuery')
    , url = require('url')
    //, request = require('./anr')
    ;

  /*
  request.post('/login', null, {
      username: $('[name=username]').val()
    , password: $('[name=password]').val()
  }).when(function () {
    console.log('[response] POST /login', arguments);
  });
  */

  function setupOauth(data) {
    $('.js-oauth .js-client-id').text(data.clientId);
    $('.js-oauth form').attr('action', data.authorizeUrl);
    $('.js-oauth').show();

    /*
    function submitForm(ev) {
      var response = {}
        ;

      response[ev.target.name] = true;
      console.log('attempted submit', ev.target.name, ev);
      ev.preventDefault();
      ev.stopPropagation();

      $.ajax({
          url: data.authorizeUrl
        , type: 'POST'
        //, contentType: 'application/json; charset=utf-8'
        , data: response //JSON.stringify(response)
        , success: function () { console.log(arguments); }
        , error: function () { console.log(arguments); }
      });
    }

    $('body').on('click', '.js-oauth form button', submitForm);
    $('body').on('submit', '.js-oauth form', function (ev) {
      console.error("it shouldn't have been possible to submit that form without click a button");
      ev.preventDefault();
      ev.stopPropagation();
    });
    */
  }

  function setupLogin() {
    // get the next_url
    $('.js-login').show();

    $('body').on('submit', '.js-login form', function (ev) {
      console.log('attempted submit', ev);
      /*
      ev.preventDefault();
      ev.stopPropagation();
      
      $.ajax({
          url: '/login'
        , type: 'POST'
        , contentType: 'application/json; charset=utf-8'
        , data: JSON.stringify({
              username: $('[name=username]').val()
            , password: $('[name=password]').val()
          })
        , success: function (data) {
            $('.js-login').hide();
            if (data.authorizeUrl) {
              setupOauth(data);
            }
          }
        , error: function () { console.log(arguments); }
      });
      */
    });
  }

  function checkLoginStatus() {
    $.ajax({
        url: '/status'
      , type: 'GET'
      , success: function (data) {
          console.log(data);
          if (data.loggedIn) {
            $('.js-login').hide();
            $('.js-meat').show();
          } else {
            setupLogin();
            $('.js-meat').hide();
          }
        }
      , error: function () { console.log(arguments); }
    });
  }

  function run() {
    var data
      , query
      ;

    if (/^#?login/.test(location.hash)) {
      setupLogin();
    }
    else if (/^#?authorize/.test(location.hash)) {
      query = location.hash.replace(/[^?]*/, '');
      console.log('query', query);
      data = url.parse('/' + query, true);
      console.log('data', data);
      setupOauth(data.query);
      location.hash = 'authorize';
    }
    else {
      checkLoginStatus();
    }
  }

  $(run);
}());
