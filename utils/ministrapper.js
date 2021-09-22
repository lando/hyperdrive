const Provider = require('nconf').Provider;

/*
 * Just a lite wrapper around nconf to make things a bit easier
 */
class Ministrapper extends Provider {
  constructor(namespace = 'ministrapper') {
    super();
    this.namespace = namespace;
  }

  // Ministrapper only cares about merging in some env namespace
  env(namespace = 'HYPERDRIVE', separator = '_', overrides = {}) {
    const debug = require('./debug')(...this.namespace, 'env');
    const starter = `${namespace.toLowerCase()}${separator}`;
    const defaults = {
      parseValues: true,
      lowerCase: true,
      separator,
      transform: obj => {
        if (obj.key.startsWith(starter)) {
          obj.key = obj.key.replace(starter, '');
          debug('set %s=%s from environment', obj.key.split(separator).join(':'), obj.value);
          return obj;
        }
      },
    };
    super.env({...defaults, ...overrides});
  }
}

module.exports = Ministrapper;
