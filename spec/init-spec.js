/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
  assert
} = require('chai');
const express = require('express');
const init = require('../lib');

describe('Init', function() {

  let middleware1 = null;
  let middleware2 = null;
  let app = null;

  beforeEach(function() {
    app = express();
    app.initialized = [];

    middleware1 = function(req, res, next) {
      req.one = true;
      return next();
    };
    middleware1.init = function(app, callback) {
      app.initialized.push(middleware1);
      return callback();
    };

    middleware2 = function(req, res, next) {
      req.two = true;
      return next();
    };
    return middleware2.init = function(app, callback) {
      app.initialized.push(middleware2);
      return callback();
    };
  });

  it('should process middlewares in order', function(done) {
    app.use(middleware1);
    app.use(middleware2);
    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      return done();
    });
  });

  it('should process middlewares of routes', function(done) {
    app.use(middleware1);
    app.route('/')
      .all(middleware2);

    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      return done();
    });
  });


  it('should process middlewares of routers', function(done) {
    const router = new express.Router();
    router.use(middleware1);
    router.use(middleware2);
    app.use(router);

    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      return done();
    });
  });


  it('should process routers', function(done) {
    const router = new express.Router();
    router.init = function(app, callback) {
      app.initialized.push(router);
      return callback();
    };
    app.use(router);

    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [router]);
      return done();
    });
  });


  it('should process nested routers', function(done) {
    const nestedRouter = new express.Router();
    nestedRouter.init = function(app, callback) {
      app.initialized.push(nestedRouter);
      return callback();
    };

    const router = new express.Router();
    router.use(nestedRouter);
    app.use(router);

    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [nestedRouter]);
      return done();
    });
  });


  it('should process middlewares of nested routers', function(done) {
    const nestedRouter = new express.Router();
    nestedRouter.use(middleware2);

    const router = new express.Router();
    router.use(middleware1);
    router.use(nestedRouter);
    app.use(router);

    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      return done();
    });
  });


  it('should not initialize middleware more than once for the same app', function(done) {
    const middleware = (req, res, next) => next();
    middleware.init = function(app, callback) {
      if (middleware.initialized) {
        return callback(new Error('Should not init more than once'));
      }
      app.initialized.push(middleware);
      return callback();
    };
    app.use(middleware);
    app.use(middleware);
    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware]);
      return done();
    });
  });


  return it('should initialize middleware for each app', function(done) {
    app.use(middleware1);

    const app2 = express();
    if (app2.initialized == null) { app2.initialized = []; }
    app2.use(middleware1);

    return init(app, function(err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1]);

      return init(app2, function(err) {
        if (err) { return done(err); }
        assert.deepEqual(app2.initialized, [middleware1]);
        return done();
      });
    });
  });
});




