var Xray = require('x-ray');
var JWTool = require('fxa-jwtool');
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
    fs.writeFile('static_secure/out.json', JSON.stringify(output))
  }
});

var express = require('express')
var serveStatic = require('serve-static')
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express()
app.use(session({ secret: 'todosecret', cookie: { maxAge: 60000 }}))

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(serveStatic('static/', {'index': ['index.html']}))
app.use('/static_secure/out.json', function(req, res, next){
  if(req.session && req.session.email){
    return res.sendFile(__dirname + '/static_secure/out.json');
  } else {
    res.sendStatus(403);
  }
});



var jwtool = new JWTool(['https://www.googleapis.com/oauth2/v3/certs'])

app.post('/api/auth', function (req, res) {
  if (! req.body.idtoken) {
    return res.send(401)
  }
  // Verify the idtoken's (JWT) signature with the key set from the configured JKU.
  // (Google's jwt include a `kid` but no `jku`)
  jwtool.verify(req.body.idtoken, { jku: 'https://www.googleapis.com/oauth2/v3/certs' })
    .then(
      function (data) {
        // ensure the token meets all of our criteria
        if (
          data.aud === '501118371406-3nuvgor9inia5mqmmm24ff1pmjss2j84.apps.googleusercontent.com'
          && data.exp > (Date.now() / 1000)
          && data.hd === 'mozilla.com'
        ) {
          // set a cookie for authenticating against our other endpoints
          req.session.email = data.email
          res.send(data)
        }
        else {
          // this user is not authorized
          res.sendStatus(401)
        }
      },
      function (err) {
        // the token was not valid
        res.send(500, err)
      }
    )
})

app.get('/config', function (req, res) {
  res.type('application/javascript')
  res.send('var client_id = "501118371406-3nuvgor9inia5mqmmm24ff1pmjss2j84.apps.googleusercontent.com"')
});

app.post('/api/logout', function(req, res) {
  if (req.session) {
    req.session.email = null;
  }
  res.sendStatus(200);
});

app.listen(10157)
console.log('Started on port 10157!')