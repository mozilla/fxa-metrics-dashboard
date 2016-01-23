/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var Xray = require('x-ray');

var dashboards = require('../dashboards');

var findOutput = function (book, cb) {
  var x = Xray();
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

module.exports = function generateDashboardOutput() {
  console.log('Fetching dashboard data...');

  async.map(dashboards, findOutput, function(err, results){
    var finalResults = results.filter(Boolean);
    var output = {};
    var output = _.extend({}, finalResults);
    if (! err && results) {
      console.log('Writing dashboard data...');
      fs.writeFile('static_secure/out.json', JSON.stringify(output))
    } else {
      console.log(err);
    }
  });
}
