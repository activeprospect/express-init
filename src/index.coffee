_ = require('lodash')
async = require('async')


recurseStack = (app, stack) ->
  stack = [stack] unless _(stack).isArray()
  s = stack.map (layer) ->
    if layer.route?.stack?
      recurseStack(app, layer.route.stack)
    else if layer.handle?.stack?
      recurseStack(app, layer.handle.stack)
    else
      init = layer.init or layer.handle?.init
      if init
        (callback) ->
          return callback() if init.done == true
          init app, (err) ->
            init.done = !err
            callback(err)

  _(s).flatten().compact().valueOf()


module.exports = (app, callback) ->
  initializers = recurseStack(app, app._router.stack)
  async.series initializers, (err) ->
    callback(err)
