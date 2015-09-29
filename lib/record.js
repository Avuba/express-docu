/**
 *
 */

var fs = require('fs'),
  uuid = require('uuid'),
  lodash = require('lodash'),
  utils = require(__dirname + '/utils'),
  app;


/**
 * create recorded cases dir if not exists.
 * delete all recorded case files.
 */
module.exports.cleanRecordedDir = function() {
  var files = [],
    docuPath = __dirname + '/../recorded';

  if (fs.existsSync(docuPath)) {
    files = fs.readdirSync(docuPath);
    files.forEach(function(file) {
      var curPath = docuPath + '/' + file;
      fs.unlinkSync(curPath);
    });
  } else {
    fs.mkdirSync(docuPath);
  }
};



/**
 * expirimental middleware that records when next(err) is called
 * @param app
 */
module.exports.recordErr = function(app) {
  app.use(module.exports.middlewareErr);
};


module.exports.middlewareErr = function(err, req, res, next) {
  console.log('docu err middleware called woohoo:');
  console.log(req.route);
  console.log(err);
  next(err);
};


module.exports.record = function(req, res, body, headers) {

  try {
    if (typeof(body) === 'string') {
      body = JSON.parse(body);
    }
  } catch (e) {
    console.log('Error DOCU record.js err in parse json:', e);
  }

  // create req.route for error cases because its missing
  if (res.statusCode >= 400) {
    //      console.log(res.statusCode, 'response', body);
    var urlParams = req.params ? Object.keys(req.params) : [];

    if (urlParams.length === 0) {
      req.route = {
        path: req.originalUrl
      };
    } else {
      //match params to routes
      var urlPieces = req.originalUrl.split('/'),
        paramIdx = 0,
        builtRoute = [];

      for (var i = 0; i < urlPieces.length; i++) {
        var urlPiece = urlPieces[i];
        //ignore query params
        if (urlPiece.length && urlPiece[0] === '?') {
          i = urlPieces.length; //kinda like break
        }
        //if this part of the url is a param
        // currently able to match UUID | objectId | Email | Number
        else if (utils.isObjectId(urlPiece) || utils.isUUID(urlPiece) || utils.isEmail(urlPiece) || utils.isNumber(urlPiece)) {
          builtRoute.push(':' + urlParams[paramIdx]);
          paramIdx++;
        }
        //else this is just a normal part
        else {
          builtRoute.push(urlPiece);
        }
      }

      if (paramIdx < urlParams.length) {
        //assume latest parts are url params
        for (var j = paramIdx; j < urlParams.length; j++) {
          //pop latest parts
          builtRoute.pop();
        }
        for (; paramIdx < urlParams.length; paramIdx++) {
          builtRoute.push(':' + urlParams[paramIdx]);
        }
      }

      req.route = {
        path: builtRoute.join('/')
      };
    }

    console.log(req.route);
  }

  //copy req params because its a weird object
  var params = {};
  var paramKeys = req.params ? Object.keys(req.params) : [];

  lodash.forEach(paramKeys, function(paramKey) {
    params[paramKey] = req.params[paramKey];
  });


  var filename = __dirname + '/../recorded/' + uuid.v4() + '.json';
  //    if (req.statusCode < 400) {
  //      console.log('recording ', filename);
  //      console.log(req.method, req.route.path, params);
  //      console.log(typeof params, 'obj?', lodash.isObject(params), 'arr?', lodash.isArray(params));
  //      console.log('isempty', lodash.isEmpty(params));
  //      console.log(Object.keys(params));
  //    }

  var allowedAvubaHeaders = lodash.values(headers);

  var recorded = {
    method: req.method,
    route: req.route.path,
    status: res.statusCode,
    request: {
      headers: lodash.pick(req.headers, allowedAvubaHeaders),
      body: req.body,
      query: req.query,
      params: params
    },
    response: {
      headers: lodash.pick(res._headers, allowedAvubaHeaders),
      body: body
    }
  };

  fs.writeFile(filename, JSON.stringify(recorded), function(err) {
    if (err) console.log(err);
  });
};
