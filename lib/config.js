/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var convict = require('convict');
var fs = require('fs');
var path = require('path');

var conf = module.exports = convict({
  google_oauth_client_id: {
    default: '501118371406-3nuvgor9inia5mqmmm24ff1pmjss2j84.apps.googleusercontent.com',
    doc: 'Google OAuth Client ID',
    format: String,
  },
  session_secret: {
    default: '',
    doc: 'Session Secret',
    format: String,
  },
  env: {
    default: 'production',
    doc: 'What environment are we running in?  Note: all hosted environments are \'production\'.',
    env: 'NODE_ENV',
    format: [
      'production',
      'development'
    ]
  },
  port: {
    default: 10157,
    doc: 'Server Port',
    env: 'PORT',
    format: 'port',
  },
});

var DEV_CONFIG_PATH = path.join(__dirname, '..', 'config', 'local.json');
var files;

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable
if (process.env.CONFIG_FILES && process.env.CONFIG_FILES.trim() !== '') {
  files = process.env.CONFIG_FILES.split(',');
} else if (fs.existsSync(DEV_CONFIG_PATH)) {
  files = [ DEV_CONFIG_PATH ];
}

if (files) {
  conf.loadFile(files);
}

if (! process.env.NODE_ENV) {
  process.env.NODE_ENV = conf.get('env');
}

var options = {
  strict: true
};

conf.validate(options);
