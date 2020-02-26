
const { assert } = require('chai');
const express = require('express');
const init = require('../lib');

describe('Init', function () {
  let middleware1 = null;
  let middleware2 = null;
  let app = null;

  beforeEach(function () {
    app = express();
    app.initialized = [];

    middleware1 = function (req, res, next) {
      req.one = true;
      next();
    };
    middleware1.init = function (app, callback) {
      app.initialized.push(middleware1);
      callback();
    };

    middleware2 = function (req, res, next) {
      req.two = true;
      next();
    };
    middleware2.init = function (app, callback) {
      app.initialized.push(middleware2);
      callback();
    };
  });

  it('should process middlewares in order', function (done) {
    app.use(middleware1);
    app.use(middleware2);
    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      done();
    });
  });

  it('should process middlewares of routes', function (done) {
    app.use(middleware1);
    app.route('/')
      .all(middleware2);

    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      done();
    });
  });

  it('should process middlewares of routers', function (done) {
    const router = new express.Router();
    router.use(middleware1);
    router.use(middleware2);
    app.use(router);

    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      done();
    });
  });

  it('should process routers', function (done) {
    const router = new express.Router();
    router.init = function (app, callback) {
      app.initialized.push(router);
      callback();
    };
    app.use(router);

    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [router]);
      done();
    });
  });

  it('should process nested routers', function (done) {
    const nestedRouter = new express.Router();
    nestedRouter.init = function (app, callback) {
      app.initialized.push(nestedRouter);
      callback();
    };

    const router = new express.Router();
    router.use(nestedRouter);
    app.use(router);

    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [nestedRouter]);
      done();
    });
  });

  it('should process middlewares of nested routers', function (done) {
    const nestedRouter = new express.Router();
    nestedRouter.use(middleware2);

    const router = new express.Router();
    router.use(middleware1);
    router.use(nestedRouter);
    app.use(router);

    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1, middleware2]);
      done();
    });
  });

  it('should not initialize middleware more than once for the same app', function (done) {
    const middleware = (req, res, next) => next();
    middleware.init = function (app, callback) {
      if (middleware.initialized) {
        return callback(new Error('Should not init more than once'));
      }
      app.initialized.push(middleware);
      callback();
    };
    app.use(middleware);
    app.use(middleware);
    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware]);
      done();
    });
  });

  it('should initialize middleware for each app', function (done) {
    app.use(middleware1);

    const app2 = express();
    if (!app2.initialized) { app2.initialized = []; }
    app2.use(middleware1);

    init(app, function (err) {
      if (err) { return done(err); }
      assert.deepEqual(app.initialized, [middleware1]);

      init(app2, function (err) {
        if (err) { return done(err); }
        assert.deepEqual(app2.initialized, [middleware1]);
        done();
      });
    });
  });
});
