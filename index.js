var Xray = require('x-ray');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var dashboards = require('./dashboards');

var x = Xray();

var findOutput = function (book, cb) {
  var error;
  try {
    x(book.url, '.output_png img@src')(function(err, contents) {
      error = err;
      cb(null, contents);
    })
  } catch (e) {
    error = e;
  }

  if (error) {
    console.log(error, 'for', book.url);
    cb(null);
  }
}


async.map(dashboards, findOutput, function(err, results){
  var finalResults = results.filter(Boolean);
  var output = {}
  var output = _.extend({}, finalResults);
  if (! err && results) {
    fs.writeFile('public/out.json', JSON.stringify(output))
  }
});

var express = require('express')
var serveStatic = require('serve-static')

var app = express()

app.use(serveStatic('public/', {'index': ['index.html']}))
app.listen(10157)