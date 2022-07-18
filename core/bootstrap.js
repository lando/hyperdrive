const findPlugins = require('./../utils/find-plugins');

const Config = require('./config');

class Bootstrapper {
  constructor(options = {}) {
    this.options = options;
    this.config = new Config(options);
  }

  static findPlugins(dir, depth = 1) {
    return findPlugins(dir, depth);
  }

  // @TODO: does it make sense to also make this an instance method?
  findPlugins(dir, depth = 1) {
    return findPlugins(dir, depth);
  }

  async run(config = {}) {
    // add the main config class to the OCLIF config
    config.hyperdrive = this.config;
    // mix in some additional and helpful config
    // the environment we are running in
    config.env = Object.hasOwn(process, 'pkg') ? 'prod' : 'dev';
    // is running in a leia test
    config.leia = Object.hasOwn(process.env, 'LEIA_PARSER_RUNNING');
    // legacy
    config.mode = 'cli';
    // is running from a binary packaged up by @vercel/pkg
    config.packaged = Object.hasOwn(process, 'pkg');
    // just some other identifiers
    config.id = 'hyperdrive';
    config.product = 'hyperdrive';
  }
}

module.exports = Bootstrapper;
