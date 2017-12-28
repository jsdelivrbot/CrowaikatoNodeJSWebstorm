var express = require('express');
const mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var querystring = require('querystring');
var https = require('https');

var expressValidator = require('express-validator');
var expressSession = require('express-session');

var passport = require('passport');
var flash = require('connect-flash');

var Promise = require('bluebird');

var index = require('./routes/index');
var userAccounts = require('./routes/signedInUsers');
const api = require('./routes/api');
const io = require('./socket/websocket');


require('./config/passport');


var app = express();




// Assigns app io variable
app.io = io;


// Set bluebird as mongoose's promise
mongoose.Promise = Promise;

// Connect to MongoDB
// mongoose.connect('mongodb://52.63.153.221:27017/visualprogger', function(err) {
//     if(err) throw err;
// });




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret: 'ianlaicrowwebsite', saveUninitialized: false, resave: false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.use('/page', userAccounts);
app.use('/api', api);
app.use('/', index);







// response


app.post('/registerForm', function (req, res) {
    console.log(req.body);


    //https://codeforgeek.com/2016/03/google-recaptcha-node-js-tutorial/
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        return res.json({"responseCode": 1, "responseDesc": "Please select captcha"});
    }

    // Put your secret key here.


    // Hitting GET request to the URL, Google will respond with success or error scenario.


    verifyRecaptcha(req.body["g-recaptcha-response"], function (success) {
        if (success) {
            res.json({"responseCode": 0, "responseDesc": "Sucess"});
        } else {
            res.json({"responseCode": 1, "responseDesc": "Failed captcha verification"});
        }
    });


    // res.sendStatus(200);
    // res.render
    // res.render('index',{layout: 'layout/layout'});
});
// server.listen(process.env.PORT, process.env.IP);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

function allowed(req) {
    let ip = req.ip.replace(/^.*:/, '');
    console.log('ip addr: ' + ip);
    return (ip === '1' || ip === '127.0.0.1');
}


module.exports = app;
