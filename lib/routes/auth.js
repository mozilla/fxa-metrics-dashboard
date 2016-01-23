var express = require('express');
var JWTool = require('fxa-jwtool');

var GOOGLE_API_JKU = 'https://www.googleapis.com/oauth2/v3/certs';

var config = require('../config');
var router = express.Router();
var jwtool = new JWTool([GOOGLE_API_JKU])

router.post('/login', function (req, res) {
  if (!req.body.idtoken) {
    return res.send(401)
  }
  // Verify the idtoken's (JWT) signature with the key set from the configured JKU.
  // (Google's jwt include a `kid` but no `jku`)
  jwtool.verify(req.body.idtoken, {jku: GOOGLE_API_JKU})
    .then(
      function (data) {
        // ensure the token meets all of our criteria
        if (
          data.aud === config.get('google_oauth_client_id')
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
});

router.get('/config', function (req, res) {
  res.type('application/javascript');
  res.send('var client_id = "'+ config.get('google_oauth_client_id') + '";');
});

router.post('/logout', function (req, res) {
  if (req.session) {
    req.session.email = null;
  }
  res.sendStatus(200);
});

module.exports = router;
