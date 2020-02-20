const _ = require('lodash');
const async = require('async');

const recurseStack = (app, stack) => {
  if (!_(stack).isArray()) { stack = [stack]; }

  const s = stack.map((layer) => {
    let initializers = [];

    if (layer.route && layer.route.stack) {
      initializers = initializers.concat(recurseStack(app, layer.route.stack));
    }

    if (layer.handle && layer.handle.stack) {
      initializers = initializers.concat(recurseStack(app, layer.handle.stack));
    }

    const init = layer.init || (layer.handle && layer.handle.init) || null;
    if (init) {
      initializers.push((callback) => {
        if (app[init] === true) { return callback(); }
        const args = [];
        if (init.length === 2) { args.push(app); }
        args.push(function (err) {
          app[init] = !err;
          callback(err);
        });
        init.apply(init, args);
      });
    }

    return initializers;
  });

  return _(s).flatten().compact().valueOf();
};

module.exports = (app, callback) => {
  const initializers = recurseStack(app, app._router.stack);
  async.series(initializers, err => callback(err));
};
