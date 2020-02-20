/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');
const async = require('async');


var recurseStack = function(app, stack) {
  if (!_(stack).isArray()) { stack = [stack]; }

  const s = stack.map(function(layer) {

    let initializers = [];

    if ((layer.route != null ? layer.route.stack : undefined) != null) {
      initializers = initializers.concat(recurseStack(app, layer.route.stack));
    }

    if ((layer.handle != null ? layer.handle.stack : undefined) != null) {
      initializers = initializers.concat(recurseStack(app, layer.handle.stack));
    }

    const init = layer.init || (layer.handle != null ? layer.handle.init : undefined);
    if (init) {
      initializers.push(function(callback) {
        if (app[init] === true) { return callback(); }
        const args = [];
        if (init.length === 2) { args.push(app); }
        args.push(function(err) {
          app[init] = !err;
          return callback(err);
        });
        return init.apply(init, args);
      });
    }

    return initializers;
  });

  return _(s).flatten().compact().valueOf();
};


module.exports = function(app, callback) {
  const initializers = recurseStack(app, app._router.stack);
  return async.series(initializers, err => callback(err));
};
