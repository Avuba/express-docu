/**
 *
 */

var fs = require('fs'),
  uuid = require('uuid'),
  lodash = require('lodash'),
  utils = require(__dirname + '/utils'),
  __private__ = {
    recordedPath: __dirname + '/../recorded'
  };


__private__.record = function(options, done) {
  var req = options.req,
    res = options.res;

  if (typeof(res.body) === 'string') {
    try {
      res.body = JSON.parse(res.body);
    } catch (err) {
      return done(new Error('res.body is not valid'));
    }
  }

  // copy req params
  var params = {},
    paramKeys = req.params ? Object.keys(req.params) : [],
    filename = __dirname + '/../recorded/' + uuid.v4() + '.json';

  lodash.forEach(paramKeys, function(paramKey) {
    params[paramKey] = req.params[paramKey];
  });

  var recorded = {
    method: req.method,
    route: req.route.path,
    status: res.statusCode,
    request: {
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: params
    },
    response: {
      headers: res._headers,
      body: res.body
    }
  };

  fs.writeFile(filename, JSON.stringify(recorded), function(err) {
    if (err) console.log(err);
  });
};


/**
 * create recorded cases dir if not exists.
 * delete all recorded case files.
exports.cleanRecordedDir = function() {
  var files = [];

  if (fs.existsSync(__private__.recordedPath)) {
    files = fs.readdirSync(__private__.recordedPath);
    files.forEach(function(file) {
      var curPath = __private__.recordedPath + '/' + file;
      fs.unlinkSync(curPath);
    });
  } else {
    fs.mkdirSync(__private__.recordedPath);
  }
};
*/



module.exports = function(req, res, next) {
  var orig = res.send;

  // CASE: create recorded folder if not exist
  if (!fs.existsSync(__private__.recordedPath)) {
    fs.mkdirSync(__private__.recordedPath);
  }

  res.send = function(body) {
    orig.bind(res)(body);
    res.body = body;

    __private__.record({
      req: req,
      res: res
    }, function(err) {
      throw err;
    });
  };

  next();
};