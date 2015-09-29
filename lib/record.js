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
exports.cleanRecordedDir = function() {
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


exports.record = function(options, done) {
  var req = options.req,
    res = options.res;

  if (typeof(body) === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch (err) {
      return done(new Error('req.body is not valid'));
    }
  }

  /*
   console.log(req.route.path);
   // CASE: record errors
   if (res.statusCode >= 400) {
   var urlParams = req.params ? Object.keys(req.params) : [];

   if (urlParams.length === 0) {
   req.route = {
   path: req.originalUrl
   }
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
   */

  // copy req params
  var params = {},
    paramKeys = req.params ? Object.keys(req.params) : [],
    filename = __dirname + '/../recorded/' + uuid.v4() + '.json';

  lodash.forEach(paramKeys, function(paramKey) {
    params[paramKey] = req.params[paramKey];
  });

  console.log(res);

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
      body: res.text
    }
  };
  console.log("HUHU")
  fs.writeFile(filename, JSON.stringify(recorded), function(err) {
    if (err) console.log(err);
  });
};
