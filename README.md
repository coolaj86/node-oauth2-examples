Daplie is Taking Back the Internet!
--------------

[![](https://daplie.github.com/igg/images/ad-developer-rpi-white-890x275.jpg?v2)](https://daplie.com/preorder/)

Stop serving the empire and join the rebel alliance!

* [Invest in Daplie on Wefunder](https://daplie.com/invest/)
* [Pre-order Cloud](https://daplie.com/preorder/), The World's First Home Server for Everyone

NodeJS OAuth2 Example
===

    git clone git://github.com/coolaj86/node-oauth2-examples.git
    pushd node-oauth2-examples
    npm install -g grunt-cli
    npm install

There are two servers: `provider` and `consumer`.

For running this demo on `localhost` you should edit `/etc/hosts` and use something like
`provider.example.com` and `consumer.example.net` as aliases of `127.0.0.1`.
Currently there's a bug that I don't understand that prevents the demo from working on localhost.

Bookface (Provider)

    pushd bookface-provider/
    npm install
    grunt build
    popd
    node bookface-provider/bin/provider

Blogthing (Consumer)

    pushd blogthing-consumer/
    npm install
    grunt build
    popd
    node blogthing-consumer/bin/consumer

Demo (runs both)

    node bin/demo

## Provider (Bookface)

A provider is a service like facebook, twitter, google+, or github that handles the details of authentication.


API

  * http://localhost:4455/login
  * http://localhost:4455/logout
  * http://localhost:4455/secret

## Consumer (Blogthing)

The consumer is a service such as Disqus, Spotify, EverNote, BlissControl, IfThisThenThat, or Calepin
    
API

  * http://localhost:7788/login
  * http://localhost:4455/logout
  * http://localhost:4455/secret

Process
---

The demo consumer will ask the provider to log you in.
If you have already logged in to the provider you don't need to login again,
instead you will be directly taken to the `allow` / `deny` prompt.

Terminology
---

The provider is an application platform such as Facebook, Google, and Twitter.

The consumer is an application registered with the platform such as StackOverflow or TweetDeck.

### RESTful resources

  * The **authorize** is usually something like `oauth/authorize` such as `https://github.com/login/oauth/authorize`
  * The **access_token** is usually something like `oauth/access_token` such as `https://github.com/login/oauth/authorize`

### scope

`scope` is arbitrary data. For example you might allow other apps to access things like
  
  * email address
  * contacts
  * birthday
  * friends

In which case you might publish your API in such a way that when you have a request where
you `encodeURI` the string `["email","contacts","birthday"]` and then present a user interface
telling the user that the application wants access to their email address, contacts, and birthday.

If the app needs access to more permissions in the future it might make another request with a larger scope.

### client\_id (and secret)

You should have some registration process by which you give the application an `id` and a `secret`.

The `client_id` will be sent in the clear and is the id you need to look up in your database.
The secret is handled by the `oauth` library for cookies or something like that.

### type

This will be `web_server` for all web servers.
If you were writing an android app it would probably be something different.

### redirect_uri

This is the uri to which the `provider` `POST`s the `code` to the `consumer`.
This logic should be handled by the `strategy`, but leave the storage abstraction up to you.

There is an additional callback provided by the `strategy` which your app should respond to.
Don't get the two mixed up. :-D

### code

This is the query parameter used as the provider responds to the request for an access token.

## debugging

  Dipping into auth\_middleware
  Dipping into requestMethods
  Dipping into strategyExecutor
  Dipping into foostrategy
