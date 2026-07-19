var express = require('express');
var passport = require('passport');
var { OLDDRAGON_BASE_URL, apiRequest, NeedsLoginError, redirectToLogin } = require('../lib/oldDragonApi');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Old Dragon API Example',
    user: req.user 
  });
});

/* GET login page. */
router.get('/login', passport.authenticate('oauth2'));

/* GET OAuth callback. */
router.get('/callback', function(req, res, next) {
  passport.authenticate('oauth2', function(err, user, info) {
    if (err) {
      console.error('Authentication Error:', err);
      return res.render('error', {
        message: 'Erro de Autenticação / Authentication Error',
        error: { status: 500, stack: err.message },
        user: req.user
      });
    }
    
    if (!user) {
      console.error('Authentication Failed:', info);
      return res.redirect('/');
    }
    
    req.logIn(user, async function(err) {
      if (err) {
        console.error('Login Error:', err);
        return next(err);
      }

      try {
        const response = await apiRequest(req, { method: 'get', url: `${OLDDRAGON_BASE_URL}/campanhas.json` });

        res.render('success', {
          title: 'Autenticação Realizada / Authentication Successful',
          user: req.user,
          accessToken: req.user.accessToken,
          campanhas: response.data
        });
      } catch (error) {
        if (error instanceof NeedsLoginError) return redirectToLogin(req, res);
        console.error('Error fetching campanhas:', error.message);
        res.render('error', {
          message: 'Erro ao Buscar Dados / Error Fetching Data',
          error: { status: error.response?.status || 500, stack: error.message },
          user: req.user
        });
      }
    });
  })(req, res, next);
});

/* GET logout */
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
