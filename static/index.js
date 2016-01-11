;window.loggedInEmail = null

function logout() {
  $.post('/api/logout');
  $('#placeholder').html('');
}

function updateUI(data) {
  window.loggedInEmail = data ? data.email : null

  if (loggedInEmail) {
    $('#spinner').show();
    $('#login').hide();
    $('#logout').show();
    $.getJSON('static_secure/out.json', function (data) {
      var items = [];
      $.each(data, function (key, val) {
        items.push('<a target="_blank" href="' + val + '"><img src="' + val + '" id="dash"' + key + '"/></a>');
      });

      $('#placeholder').html(items)

    });
  } else {
    $('#logout').hide();
    $('#login').show();
    logout();
  }
}


function signInChanged(signedIn) {
  console.log('signed in: ' + signedIn)
}

function userChanged(user) {
  var id_token = user.getAuthResponse().id_token
  console.log('user changed: ' + id_token)
  if (id_token) {
    $.ajax({
      type: 'POST',
      url: '/api/auth', // this creates a cookie used to authenicate other api requests
      data: 'idtoken=' + id_token,
      contentType: 'application/x-www-form-urlencoded',
      dataType: 'json',
      success: updateUI,
      error: logout
    })
  }
  else {
    // this case triggers when the page is loaded and a user is not logged in
    updateUI()
  }
}

gapi.load(
  'auth2',
  function () {
    // initialize the auth api with our client_id provided by Google in their
    // dev console and restrict login to accounts on the mozilla hosted domain.
    // https://developers.google.com/identity/sign-in/web/devconsole-project
    //
    // client_id is set by <script src='/config'>
    var auth2 = gapi.auth2.init(
      {
        client_id: client_id,
        hosted_domain: 'mozilla.com'
      }
    )
    // listen for sign-in state changes
    auth2.isSignedIn.listen(signInChanged)

    // listen for changes to current user
    auth2.currentUser.listen(userChanged)

    // wire up the Sign In button
    auth2.attachClickHandler(document.getElementById('login'))

    // wire up logout button
    $('#logout').click(
      function (ev) {
        ev.preventDefault()
        auth2.signOut()
      }
    )
  }
)
