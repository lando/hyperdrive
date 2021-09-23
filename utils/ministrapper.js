const Provider = require('nconf').Provider;

/*
 * Just a lite wrapper around nconf to make things a bit easier
 *
 * @NOTE: eventually this should be a config loading util for both lando/hyperdrive
 *
 * should be able to:
 *  0. convenience methods for json/yaml
 *  1. load YAML files
 *  2. load "plugin manifests"
 *  3. load "landofiles"
 *  4. load namespaced envvars
 *
 *
 *
 *
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
