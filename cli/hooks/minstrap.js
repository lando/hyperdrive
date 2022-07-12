const debug = require('debug')('minstrap:@lando/hyperdrive');
const has = require('lodash/has');

module.exports = async({config}) => {
  debug('minstrap event works!');

  // mix in some additional and helpful config
  // the environment we are running in
  config.env = has(process, 'pkg') ? 'prod' : 'dev';
  // is running in a leia test
  config.leia = has(process, 'env.LEIA_PARSER_RUNNING');
  // legacy
  config.mode = 'cli';
  // is running from a binary packaged up by @vercel/pkg
  config.packaged = has(process, 'pkg');
  // just some other identifiers
  config.id = 'hyperdrive';
  config.product = 'hyperdrive';
};
