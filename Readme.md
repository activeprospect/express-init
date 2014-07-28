## Express Init

This Node.JS utility module initializes Express 4.x middleware and calls back when initialization is complete. This allows
your middleware to perform some asynchronous initialization before the server starts.

[![Build Status](https://travis-ci.org/activeprospect/express-init.svg)](https://travis-ci.org/activeprospect/express-init)

## Usage

Your middleware must implement the `init` function, which accepts two parameters: the `app` instance and a `callback`.
When your middleware is finished initializing, invoke the callback with an error if one occurred. A middleware's init
function will only be called once, even if the middleware is used multiple times in the same app.

```javascript
var initialize = require('express-init');

var middleware = function (req, res, next) {
  // ... the stuff dreams are made of
  next()
};

middleware.init = function(app, callback) {
  // initialize your middleware and callback when ready
  callback();
};

var app = express();
app.use(middleware);
app.get('/', function(req, res) {
  req.send('ok');
});

// use this module to initialize the app
// each middleware init function will be called serially
initialize(app, function(err) {
  if (err)
    throw new Error(err);

  // the middleware is initialized now, so start the server
  app.listen(3000);
});
```
