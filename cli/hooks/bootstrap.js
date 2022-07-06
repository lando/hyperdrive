const debug = require('debug')('bootstrap:@lando/hyperdrive');
const fs = require('fs');
const nconf = require('nconf');

nconf.formats.yaml = require('nconf-yaml');

module.exports = async(thing) => {
  // @TODO: do we need a clear cache option?
  // @TODO: lets test to see whether its even worth caching this?
  // check to see if we have a compiled config file?
  // load and return that if we do?
  debug('bootstrapping...');
  console.log(thing)


  // copy default config file to config dir so user can modify


  // merge in all config sources and generate config file


  process.exit(1);
  debug('bootstrapping...');
  // await options.config.runHook('test', options);
};
