var Cookies = module.exports = function(req, res) {
  this.req = req;
  this.res = res;
  this.cookies = null;
};

Cookies.prototype.defaults = function() {
  return {};
};

Cookies.prototype.initialize = function() {
  // somewhat lazy
  this.cookies = {};
  var header_cookie = this.req.headers.cookie;
  if (header_cookie) {
    var eq_index, name, cookies = header_cookie.split(/;\s*/);
    for (var cookie, i = 0; cookie = cookies[i]; i++) {
      eq_index = cookie.search(/=/);
      name = cookie.slice(0, eq_index);
      this.cookies[name] = cookie.slice(eq_index + 1);
    }
  }
};

Cookies.prototype.get = function(name) {
  if (this.cookies === null) this.initialize();
  return this.cookies[name];
};

Cookies.prototype.set = function(name, value, custom_options) {
  var set_cookie_headers = this.res.getHeader("Set-Cookie"),
    headers = set_cookie_headers ? [set_cookie_headers] : [],
    opts = this.defaults();

  if (custom_options !== undefined) {
    for (var key in custom_options)
      opts[key] = custom_options[key];
  }

  opts.name = name;
  opts.value = value;

  var cookie = new Cookie(opts);
  headers.push(cookie.toString());
  this.res.setHeader("Set-Cookie", headers);

  // make chainable
  return this;
};

Cookies.prototype.expire = Cookies.prototype.delete = function(name, opts) {
  return this.set(name, '', {expires: new Date(0)});
};

function Cookie(opts) {
  for (var key in opts)
    this[key] = opts[key];
  if (opts.value === undefined) this.value = '';
  if (opts.expires === undefined) this.expires = new Date(0);
  if (opts.path === undefined) this.path = '/';
}
Cookie.prototype.toString = function() {
  // Going off http://www.ietf.org/rfc/rfc2109.txt
  var avs = [this.name + '=' + this.value];
  if (this.comment) avs.push("Comment=" + this.comment);
  if (this.domain) avs.push('Domain=' + this.domain);
  if (this.max_age) avs.push('Max-Age=' + this.max_age);
  if (this.path) avs.push('Path=' + this.path);
  if (this.secure) avs.push('secure');
  if (this.version) avs.push('Version=1'); // this is technically required by RFC 2109

  // these are not in RFC 2109
  if (this.http_only) avs.push('httponly');
  if (this.expires) avs.push('expires=' + this.expires.toUTCString());

  return avs.join('; ');
};
