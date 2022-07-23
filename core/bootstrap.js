const Config = require('./config');

class Bootstrapper {
  constructor(options = {}) {
    this.options = options;
    this.config = new Config(options);
  }

  // recurse up from given directory until you find a given landofile?
  // static findApp(file = '.lando.yml') {

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
    // just some other identifiers
    config.id = this.config.get('core.id') || config.bin || config.dirname;
    config.product = this.config.get('core.product') || config.bin || config.dirname;

    // set the core debug flag
    config.debug = ['1', 'true'].includes(this.config.get('core.debug')) ? true : this.config.get('core.debug');
    // enable debugging if the config is set
    // @NOTE: this is only for debug=true set via the configfile, the --debug turns debugging on before this
    if (config.debug) require('debug').enable(config.debug === true ? '*' : config.debug);

    // mix in some additional and helpful config
    // the environment we are running in
    config.env = Object.hasOwn(process, 'pkg') ? 'prod' : 'dev';
    // is running in a leia test
    config.leia = Object.hasOwn(process.env, 'LEIA_PARSER_RUNNING');
    // legacy
    config.mode = 'cli';
    // is running from a binary packaged up by @vercel/pkg
    config.packaged = Object.hasOwn(process, 'pkg');

    // add the main config class to the OCLIF config
    config[config.product] = this.config;
  }
}

module.exports = Bootstrapper;
