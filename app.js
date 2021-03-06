let express = require('express');
let expressSession = require('express-session');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let passport = require('passport');

let routes = require('./routes/index');
let users = require('./routes/users');
let login = require('./routes/login');
let news = require('./routes/news');
let commodity = require('./routes/commodity');
let items = require('./routes/items');
let signup = require('./routes/signup');
let bid = require('./routes/bid');
let notification = require('./routes/notification');
let usermessage = require('./routes/message');
let country = require('./routes/country');
let recentsearch = require('./routes/recentsearch');
let offers = require('./routes/offer');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(cookieParser());

//setting up passportjs
let flash = require("connect-flash");
app.use(flash());
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//----------------- Following methods moved to user route-------------------
// passport.use(new passportLocal.Strategy(verifyCredentials));
// passport.use(new passportHttp.BasicStrategy(verifyCredentials));
// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });
// passport.deserializeUser(function(id, done) {
//   //Query database of cache here!
//   done(null, {id: id, name: id});
// });
// function ensureAuthenticated(req, res, next) {
//   if(req.isAuthenticated()) {
//     next();
//   } else {
//     res.send(403);
//   }
// }
// function verifyCredentials(username, password, done) {
//   if(username === password) {
//     done(null, {id: username, name: username});
//   } else {
//     done(null, null);
//   }
// }
//---------------------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/user', users);
app.use('/api/user', users);
app.use('/api/commodity', commodity);
app.use('/api/items', items);
app.use('/api/bid', bid);
app.use('/api/notification', notification);
app.use('/api/messages', usermessage);
app.use('/api/countries', country);
app.use('/api/recentsearch', recentsearch);
app.use('/api/offer', offers);

//app.use('/api', passport.authenticate('basic', {session: false}));
app.use('/api/news', news);

// catch 404 and forward to error handler
app.use('**', function (req, res, next) {
  res.render('404', {user : {}});
});

// error handlers

// development error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
      .render('error', {
        message: err.message,
        error: err
      });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
