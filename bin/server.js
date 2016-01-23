/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');
var config = require('../lib/config');

var dashboards = require('../lib/dashboards')();

var app = require('../lib/express')();
var routesAuth = require('../lib/routes/auth');
app.use('/auth', routesAuth);
app.use('/static_secure/out.json', function(req, res, next){
  if(req.session && req.session.email){
    return res.sendFile(path.resolve(__dirname + '/../static_secure/out.json'));
  } else {
    res.sendStatus(403);
  }
});

var port = config.get('port');
app.listen(port);
console.log('Started on port:', port);