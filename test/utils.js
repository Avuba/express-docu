exports.express = require('express');
exports.http = require('http');
exports.expressDocu = require(__dirname + '/../index');
exports.request = require('supertest');
exports.sinon = require('sinon');
exports.fs = require('fs');
exports.bodyParser = require('body-parser');
exports.jade = require('jade');


var chai = require('chai');
global.should = chai.should();
global.expect = chai.expect;
global.assert = chai.assert;


exports.clearCache = function() {
  for (var i in require.cache) {
    //delete everything except this file
    if (!i.match(/test\/utils/gi)) {
      delete require.cache[i];
    }
  }
};