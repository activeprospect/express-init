assert = require('chai').assert
express = require('express')
init = require('../src')

describe 'Init', ->

  middleware1 = (req, res, next) ->
    req.one = true
    next()
  middleware1.init = (app, callback) ->
    app.initialized.push(middleware1)
    callback()

  middleware2 = (req, res, next) ->
    req.two = true
    next()
  middleware2.init = (app, callback) ->
    app.initialized.push(middleware2)
    callback()

  app = null

  beforeEach ->
    app = express()
    app.initialized = []

  it 'should process middlewares in order', (done) ->
    app.use middleware1
    app.use middleware2
    init app, (err) ->
      return done(err) if err
      assert.deepEqual app.initialized, [middleware1, middleware2]
      done()

  it 'should process middlewares of routes', (done) ->
    app.use middleware1
    app.route('/')
      .all middleware2

    init app, (err) ->
      return done(err) if err
      assert.deepEqual app.initialized, [middleware1, middleware2]
      done()


  it 'should process middlewares of routers', (done) ->
    router = new express.Router()
    router.use middleware1
    router.use middleware2
    app.use router

    init app, (err) ->
      return done(err) if err
      assert.deepEqual app.initialized, [middleware1, middleware2]
      done()

  it 'should process middlewares of nested routers', (done) ->
    nestedRouter = new express.Router()
    nestedRouter.use middleware2

    router = new express.Router()
    router.use middleware1
    router.use nestedRouter
    app.use router

    init app, (err) ->
      return done(err) if err
      assert.deepEqual app.initialized, [middleware1, middleware2]
      done()


