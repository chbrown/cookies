## Cookies

Inspired by [jed/cookies](https://github.com/jed/cookies), but simpler (no signatures).
This refactor has no dependencies and different defaults.

* Install it at the command line:

```bash
npm install git://github.com/chbrown/cookies.git
```

* Or put it in your `package.json`:

```json
{
  ...,
  "dependencies": {
    "cookies": "git://github.com/chbrown/cookies.git",
    ...
  }
}
```

### Features

* Somewhat lazy: All cookies are read into an object/hash, but only if one is requested. So you can attach a `cookies` object to the request / response in your main router, but if you never `.get()` or `.set()` a cookie,
* Insecure: Cookies are neither `httponly` nor `secure` by default.
* Defaults: The only out-of-the-box default is `path=/`.

## API

### new Cookies([request], [response])

* `request` IncomingMessage | null The first argument from an `http` server's `request` event
* `response` ServerResponse | null The second argument from an `http` server's `request` event

Create new `cookies` object, which provides `get`, `set`, and `del` methods.

    req.cookies = new Cookies(req, res);

### Cookies.attach([request], [response])

Simply attaches a new `cookies` object to `request` (or `response`, if `request` is null).

### cookies.get(name)

* `name` String Name of the cookie

Returns the string value of the cookie. Also triggers `cookies.initialize()` if this is the first time a cookie has been accessed since `cookies` was created.

Does not require that `response` was set in the `new Cookies(request, ...)` constructor.

### cookies.set(name, value, [options])

* `name` String Name of the cookie
* `value` String Value of the cookie
* `options` Object | null Cookie settings

Adds a cookie to the queued 'Set-Cookie' headers for the current response.
Can be called multiple times; it will not clear cookies previously added to the response.
(Use `response.removeHeader('Set-Cookie');` if you want to remove pending cookies.)

Obeys [RFC 2109](http://www.ietf.org/rfc/rfc2109.txt) (mostly) when formatting the string.

This will only set the cookie if `response.headersSent` is false.

Possible options:

```javascript
{
  comment: String,
  domain: String,
  max_age: String | Number,
  path: String,               // defaults to '/'
  secure: Boolean,            // defaults to false
  version: Boolean,           // defaults to false, contrary to RFC 2109
  http_only: Boolean,         // defaults to false, not in RFC 2109
  expires: Date               // not in RFC 2109
}
```

Does not require that `request` was set in the `new Cookies(..., response)` constructor.

### cookies.del(name, [options])

* `name` String Name of the cookie
* `options` Object | null Cookie settings

Set cookie's value to `''`, and it's expire date to the beginning of epoch time, i.e., `new Date(0)`, using the same mechanism as `cookies.set`.

### Cookies.prototype.defaults = default_options

* `default_options` Object | Function Base used for all `set()` calls.

Set this to an object, or function that returns an object, using the possible options from the [`set()` section](#cookiessetname-value-options).

### Cookies.serialize(name, value, options)

* `name` String Name of the cookie
* `value` String Value of the cookie
* `options` Object | null Cookie settings

Serialize a cookie name, value, and options into the string representation that the 'Set-cookie' http header requires.

## Demo [`server.js`](server.js)

```javascript
var Cookies = require('cookies');
var http = require('http');

Cookies.prototype.defaults = function() {
  // expire 1 month in the future
  var one_month_from_now = new Date(Date.now() + (31 * 24 * 60 * 60 * 1000));
  return {
    expires: one_month_from_now, // <-- a Date object
    path: '/'
  };
};

http.createServer(function(req, res) {
  req.cookies = new Cookies(req, res);

  var history = {};
  var history_json = req.cookies.get('history');
  try {
    history = JSON.parse(history_json);
  }
  catch (exc) {
    console.error(exc);
  }
  history[req.url] = (history[req.url] || 0) + 1;

  var new_history_json = JSON.stringify(history);
  req.cookies.set('history', new_history_json);

  res.writeHead(200);
  for (var page in history) {
    res.write('You have been to ' + page + ' ' + history[page] + ' times.\n');
  }
  res.end();
}).listen(8383, '127.0.0.1', function() {
  console.log('Serving example cookies server at localhost:8383');
});
```

## License

Copyright © 2012-2013 Christopher Brown.
[MIT Licensed](https://chbrown.github.io/licenses/MIT/#2012-2013).
