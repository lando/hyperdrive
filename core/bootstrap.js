const Config = require('./config');

class Bootstrapper {
  constructor(options = {}) {
    this.options = options;
    this.config = new Config(options);
  }

  // recurse up from given directory until you find a given file?
  // static findApp(dir, depth = 1) {

  // }

  static findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  // assemble app configuration using ordered list of files
  // static getAppConfig(dir, depth = 1) {

  // }

  static sortPlugins(plugins) {
    return require('./../utils/sort-plugins')(plugins, {app: 1, team: 2, global: 3, core: 4});
  }

  // @TODO: does it make sense to also make this an instance method?
  findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  // @TODO: does it make sense to also make this an instance method?
  sortPlugins(plugins) {
    return require('./../utils/sort-plugins')(plugins, {app: 1, team: 2, global: 3, core: 4});
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
