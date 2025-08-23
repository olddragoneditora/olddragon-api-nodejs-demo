var express = require('express');
var passport = require('passport');
var axios = require('axios');
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
        message: 'Erro de Autenticação',
        error: { status: 500, stack: err.message }
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
        const OLDDRAGON_BASE_URL = process.env.OLDDRAGON_BASE_URL || "https://olddragon.com.br";
        const response = await axios.get(`${OLDDRAGON_BASE_URL}/campanhas.json`, {
          headers: {
            Authorization: `Bearer ${req.user.accessToken}`,
            'User-Agent': 'OldDragon-Example-App',
          },
        });
        
        res.render('success', {
          title: 'Autenticação Realizada',
          accessToken: req.user.accessToken,
          campanhas: response.data
        });
      } catch (error) {
        console.error('Error fetching campanhas:', error);
        res.render('error', {
          message: 'Erro ao Buscar Dados',
          error: { status: 500, stack: 'Erro ao buscar campanhas da API' }
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
