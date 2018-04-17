/**
 * Taken from https://gist.github.com/chmanie/da3c150cc8fda254a1a5
 */

var EventEmitter = require('events').EventEmitter;
var httpMocks = require('node-mocks-http');

module.exports = {
  createRequest: httpMocks.createRequest.bind(httpMocks),
  createResponse: function(opts) {
    opts = opts || {};
    opts.eventEmitter = EventEmitter;

    var res = httpMocks.createResponse(opts);

    var emit = res.emit;
    res.emit = function(evt) {
      if (evt === 'end') {
        let data = res._getData();
        if (res._isJSON() && typeof data === 'string') {
          data = JSON.parse(data);
        }
        emit.call(res, 'end', data);
      } else {
        emit.apply(res, arguments);
      }
    };

    var end = res.end;
    res.end = function() {
      var args = arguments;
      process.nextTick(function() {
        end.apply(res, args);
      });
    };

    var json = res.json;
    res.json = function() {
      json.apply(res, arguments);
      res._isJSON = true;
      res.end();
    };

    var redirect = res.redirect;
    res.redirect = function() {
      redirect.apply(res, arguments);
      res.end();
    };

    return res;
  }
};
