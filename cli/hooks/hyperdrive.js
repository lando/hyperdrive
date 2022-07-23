const Config = require('./../../core/config');
const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:config');
const path = require('path');

module.exports = async({config}) => {
  debug('config event works!');
  // set hyperdrive specific config
  const opts = {
    cached: path.join(config.cacheDir, 'lando.json'),
    env: 'LANDO',
    id: 'lando',
    sources: {lando: path.join(config.cacheDir, 'lando.json')},
  };
  config.lando = new Config(opts);
};
