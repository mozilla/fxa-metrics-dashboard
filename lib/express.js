/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = require('./config');

module.exports = function configureExpress() {
  var app = express();

  if (! config.get('session_secret')) {
    throw new Error('Set a session secret in configuration');
  }

  app.use(session({
    secret: config.get('session_secret'),
    cookie: {
      maxAge: 60000,
    },
    saveUninitialized: true,
    resave: false,
  }));

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  app.use(serveStatic('static/', {'index': ['index.html']}))

  return app;
};
