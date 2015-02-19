_ = require('lodash')
async = require('async')


recurseStack = (app, stack) ->
  stack = [stack] unless _(stack).isArray()
  s = stack.map (layer) ->

    initializers = []

    if layer.route?.stack?
      initializers = initializers.concat(recurseStack(app, layer.route.stack))

    if layer.handle?.stack?
      initializers = initializers.concat(recurseStack(app, layer.handle.stack))

    init = layer.init or layer.handle?.init
    if init
      initializers.push (callback) ->
        return callback() if init.done == true
        init app, (err) ->
          init.done = !err
          callback(err)

    initializers

  _(s).flatten().compact().valueOf()


module.exports = (app, callback) ->
  initializers = recurseStack(app, app._router.stack)
  async.series initializers, (err) ->
    callback(err)
