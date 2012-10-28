var Cookies = require('./cookies'),
  http = require('http');

Cookies.prototype.defaults = function() {
  // expire 1 month in the future
  var expires = new Date(Date.now() + (31 * 24 * 60 * 60 * 1000));
  return {expires: expires};
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
}).listen(8383, '127.0.0.1');
