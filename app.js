var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');

var indexRouter = require('./routes/index');
var personagensRouter = require('./routes/personagens');
var { OLDDRAGON_BASE_URL } = require('./lib/oldDragonApi');

var app = express();

passport.use(
  "oauth2",
  new OAuth2Strategy(
    {
      authorizationURL: `${OLDDRAGON_BASE_URL}/authorize`,
      tokenURL: `${OLDDRAGON_BASE_URL}/token`,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL || `http://localhost:8080/callback`,
      scope: "openid email content.read content.write offline_access",
      prompt: "consent",
      scopeSeparator: " ",
      state: true,
      pkce: true,
    },
    (accessToken, refreshToken, profile, cb) => {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      return cb(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/personagens', personagensRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.user = req.user;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
