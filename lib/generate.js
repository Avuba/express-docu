var jade = require('jade'),
  uuid = require('uuid'),
  lodash = require('lodash'),
  fs = require('fs'),
  utils = require(__dirname + '/utils.js');


/**
 * generate docu => save outout to index.html
 */
module.exports = function() {
  var files = [],
    groups = {},
    path = __dirname + '/../recorded';
  if (!fs.existsSync(path)) {
    throw new Error('no docu created, no recorded files dir');
  }
  files = fs.readdirSync(path);
  if (!files.length) throw new Error('no recorded files :(');

  //collect data from recorded tests into a grouped object
  files.forEach(function(file) {
      var curPath = path + '/' + file;
      if (curPath.indexOf('.json') === -1) return;

      // read & parse
      try {
        var recordedFile = fs.readFileSync(curPath, 'utf-8'),
          recordedFileAsJSON = JSON.parse(recordedFile);
      } catch (e) {
        return;
      }

      function omitEmpty(obj) {
        return lodash.omit(obj, function(value) {
          return typeof value === 'undefined' || (typeof value === 'object' && lodash.isEmpty(value));
        });
      }

      //remove empty stuff
      recordedFileAsJSON.request = omitEmpty(recordedFileAsJSON.request);
      recordedFileAsJSON.response = omitEmpty(recordedFileAsJSON.response);
      recordedFileAsJSON = omitEmpty(recordedFileAsJSON);

      if (!recordedFileAsJSON.route) return;

      // group by route
      var group = recordedFileAsJSON.route.split('/')[1],
        status = recordedFileAsJSON.status;

      if (!groups.hasOwnProperty(group)) {
        groups[group] = {};
      }

      var key = recordedFileAsJSON.method + ' ' + recordedFileAsJSON.route;

      // add example array for: 200 -> GET_WHATEVER
      if (!groups[group].hasOwnProperty(key)) {
        groups[group][key] = {};
        groups[group][key].examples = {};
      }

      // group by status code
      if (!groups[group][key].examples.hasOwnProperty(status)) {
        groups[group][key].examples[status] = [];
      }

      //only collect max 5 examples for each status
      //        if (groups[group][key].examples[status].length < 5) {
      recordedFileAsJSON._id = uuid.v4();
      groups[group][key].examples[status].push(recordedFileAsJSON);
      //        }
    }
  );


  //go over groups and try to summarize params for success cases
  lodash.forEach(groups, function(group, groupKey) {
    lodash.forEach(group, function(route, routeKey) {
      route.summary = {};

      var copyFn = function(baseObj, baseObjKey, keysToCopy) {
        if (lodash.isEmpty(baseObj) || lodash.isEmpty(baseObj[baseObjKey])) return;
        if (typeof route.summary[baseObjKey] !== 'object') {
          route.summary[baseObjKey] = {};
        }

        lodash.forEach(keysToCopy, function(keyToCopy) {
          var objToCopy = baseObj[baseObjKey][keyToCopy];
          if (lodash.isArray(objToCopy)) {
            route.summary[baseObjKey][keyToCopy] = {
              'Array Of :': {values: objToCopy, type: 'unknown', required: true}};
          }
          else if (!lodash.isEmpty(objToCopy)) {
            if (typeof route.summary[baseObjKey][keyToCopy] !== 'object') {
              route.summary[baseObjKey][keyToCopy] = {};
            }
            lodash.forEach(objToCopy, function(whatVal, whatKey) {
              if (typeof route.summary[baseObjKey][keyToCopy][whatKey] !== 'object') {
                route.summary[baseObjKey][keyToCopy][whatKey] = {values: [], type: 'unknown', required: true};
              }
              route.summary[baseObjKey][keyToCopy][whatKey].values.push(whatVal);
              //              console.log(routeKey, summaryKeyName, '->', whatKey, '->', whatVal);
            });

          }
        });
      };

      //go over success examples and collect param names, values
      lodash.forEach(route.examples, function(examples, examplesKey) {
        if (examplesKey < 400) {
          lodash.forEach(examples, function(example) {
            copyFn(example, 'request', ['headers', 'params', 'body', 'query']);
            copyFn(example, 'response', ['headers', 'body']);
          });
        }
      });

      //go over success examples again and deduce which params are required
      lodash.forEach(route.examples, function(examples, examplesKey) {
        if (examplesKey < 400) {
          lodash.forEach(examples, function(example) {
            if (example.request && example.request.body) {
              var diff = lodash.difference(Object.keys(route.summary.request.body), Object.keys(example.request.body));
              lodash.forEach(diff, function(diffKey) {
                route.summary.request.body[diffKey].required = false;
              });
            }
            if (example.request && !lodash.isEmpty(route.summary.request.query) && lodash.isEmpty(example.request.query)) {
              lodash.forEach(route.summary.request.query, function(queryParam, queryParamKey) {
                queryParam.required = false;
              });
            }
            else if (example.request && example.request.query) {
              var diff = lodash.difference(Object.keys(route.summary.request.query), Object.keys(example.request.query));
              lodash.forEach(diff, function(diffKey) {
                route.summary.request.query[diffKey].required = false;
              });
            }
          });
        }
      });

      //go over summary and
      // for each summary category (request, response)
      // for each summary group (headers, body, params, query)
      // go over summary group param names and:
      // - remove duplicate examples values
      // - try to guess value type
      lodash.forEach(route.summary, function(summaryCategory, summaryCategoryKey) {
        lodash.forEach(summaryCategory, function(summaryGroup, summaryGroupKey) {

          lodash.forEach(summaryGroup, function(summaryGroupParamObj, summaryGroupParamType) {
            //            console.log(routeKey, summaryGroupKey, summaryGroupParamType, summaryGroupParamObj);
            var routeThing = route.summary[summaryCategoryKey][summaryGroupKey][summaryGroupParamType];
            routeThing.values = lodash.uniq(summaryGroupParamObj.values);
            if (routeThing.values.length) {
              var types = [];
              lodash.forEach(routeThing.values, function(exampleVal) {

                if (lodash.isArray(exampleVal)) {
                  types.push('Array');
                }
                else if (lodash.isObject(exampleVal)) {
                  types.push('Object');
                }
                else if (utils.isObjectId(exampleVal)) {
                  types.push('ObjectId');
                }
                else if (utils.isUUID(exampleVal)) {
                  types.push('uuid');
                }
                else if (utils.isNumber(exampleVal)) {
                  types.push('Number');
                }
                else if (utils.isDate(exampleVal)) {
                  types.push('Date');
                }
                else {
                  types.push('String');
                }
              });
              routeThing.type = lodash.uniq(types).join(' | ');
            }
          });
        });
      });
      //        console.log(route.summary);
    });
  });

  //sort obj by keys using lodash
  var sortedGroups = {};
  lodash.forEach(groups, function(group, groupKey) {
    //sort the group and put it in sortedGroups
    var sortedKeys = lodash.sortBy(lodash.keys(group), function(k) {
      return k.substr(k.indexOf('/'));
    });
    sortedGroups[groupKey] = {};

    lodash.forEach(sortedKeys, function(k) {
      sortedGroups[groupKey][k] = groups[groupKey][k];
    });
  });

  // render jade & store html
  var
    jadeTemplate = __dirname + '/../views/index.jade',
    template = fs.readFileSync(jadeTemplate, 'utf8'),
    jadeFn = jade.compile(template, { filename: jadeTemplate, pretty: true }),
    renderedTemplate = jadeFn({ groups: sortedGroups });

  if (!fs.existsSync(__dirname + '/../output')) {
    fs.mkdirSync(__dirname + '/../output');
  }
  fs.writeFileSync(__dirname + '/../output/index.html', renderedTemplate);

};