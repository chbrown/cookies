'use strict'; /*jslint node: true, es5: true, indent: 2 */
var Cookies = module.exports = function(req, res) {
  this.req = req;
  this.res = res;
  this.cookies = null;
};

// `defaults` exists at the prototype level so we can have one closure for every request.
Cookies.prototype.defaults = function() {
  return {
    path: '/'
  };
};

Cookies.prototype.initialize = function() {
  // somewhat lazy; we only read the cookies once we need one
  if (!this.req) throw new Error('You must specify at least: new Cookies(IncomingMessage, ...)');
  this.cookies = {};
  var header_cookie = this.req.headers.cookie;
  if (header_cookie) {
    var cookies = header_cookie.split(/;\s*/);
    for (var cookie, i = 0; (cookie = cookies[i]); i++) {
      var split_at = cookie.indexOf('=');
      var name = cookie.slice(0, split_at);
      this.cookies[name] = cookie.slice(split_at + 1);
    }
  }
};

Cookies.prototype.get = function(name) {
  if (!this.cookies) {
    this.initialize();
  }
  return this.cookies[name];
};

Cookies.prototype.set = function(name, value, opts) {
  if (!this.res) throw new Error('You must specify at least: new Cookies(..., ServerResponse)');
  var existing_set_cookie = this.res.getHeader('Set-Cookie');
  var set_cookie_headers = existing_set_cookie ? [existing_set_cookie] : [];

  if (opts === undefined) opts = {};
  var default_opts = this.defaults.call ? this.defaults() : this.defaults;
  for (var key in default_opts) {
    // the defaults only overwrite underfined values
    if (default_opts.hasOwnProperty(key) && opts[key] === undefined) {
      opts[key] = default_opts[key];
    }
  }

  console.error(default_opts, Cookies.serialize(name, value, opts));

  set_cookie_headers.push(Cookies.serialize(name, value, opts));
  this.res.setHeader('Set-Cookie', set_cookie_headers);

  return this; // chainable
};

Cookies.prototype.del = function(name, opts) {
  if (opts === undefined) opts = {};
  if (opts.expires === undefined) opts.expires = new Date(0);
  return this.set(name, '', opts); // chainable
};

Cookies.serialize = function(name, value, cookie) {
  // Going off http://www.ietf.org/rfc/rfc2109.txt
  var parts = [name + '=' + value];
  if (cookie.comment) parts.push('Comment=' + cookie.comment);
  if (cookie.domain) parts.push('Domain=' + cookie.domain);
  if (cookie.max_age) parts.push('Max-Age=' + cookie.max_age);
  if (cookie.path) parts.push('Path=' + cookie.path);
  if (cookie.secure) parts.push('secure');
  if (cookie.version) parts.push('Version=1'); // this is technically required by RFC 2109

  // these are not in RFC 2109
  if (cookie.http_only) parts.push('httponly');
  if (cookie.expires) parts.push('expires=' + cookie.expires.toUTCString());

  return parts.join('; ');
};

Cookies.attach = function(req, res) {
  req.cookies = new Cookies(res, res);
};
