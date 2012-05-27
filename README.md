NodeJS OAuth2 Example
===

This is an exploratory demo with both an OAuth2 provider and consumer.
The demo provider lets you login and can grant access to the consumer.

You should clone it to play.

    git clone git://github.com/coolaj86/node-oauth2-examples.git
    cd node-oauth2-examples
    npm install

The Demo Provider (Foo)
---

    node bin/provider
    # runs server/lib/provider.js
    # uses oauth2-provider
    # http://localhost:4455/login
    # http://localhost:4455/logout
    # http://localhost:4455/secret

The Demo Consumer
---

    node bin/consumer
    # runs server/lib/consumer.js and foo-oauth2-strategy.js
    # uses connect-auth and node-oauth
    # http://localhost:7788/login

The demo consumer will ask the provider to log you in.
If you have already logged in to the provider you don't need to login again,
instead you will be directly taken to the `allow` / `deny` prompt.

P.S. It's almost 3am. I'll finish these docs sometime later.
The code is pretty clean, but still has some ugly in it
(mostly from the examples I copied and haven't refactored well-enough yet)

Terminology
---

The provider is an application platform such as Facebook, Google, and Twitter.

The consumer is an application registered with the platform such as TweetDeck.

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
