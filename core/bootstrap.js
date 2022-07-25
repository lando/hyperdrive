const Config = require('./config');

class Bootstrapper {
  constructor(options = {}) {
    this.config = new Config(options);
    this.options = options;
    this.registry = options.registry || 'registry';
  }

  // recurse up from given directory until you find a given landofile?
  // static findApp(file = '.lando.yml') {

  // }

  static collapsePlugins(plugins) {
    return require('../utils/collapse-plugins')(plugins);
  }

  static findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  // assemble app configuration using ordered list of files
  // static getAppConfig(dir, depth = 1) {

  // }

  static groupPlugins(plugins) {
    return require('../utils/group-plugins')(plugins, {app: 1, team: 2, global: 3, core: 4});
  }

  // helper to get a component (and config?) from the registry
  getComponent(component, {registry = this.registry, config} = {}) {
    // @TODO try/catch here? for better error stuff
    // @TODO use a move this into utils and ref like others
    const Component = require(this.config.get(`${registry}.${component}`));
    const cckey = config || component.split('.')[component.split('.').length - 1];
    return {Component, cc: this.config.get(cckey) || {}};
  }

  collapsePlugins(plugins) {
    return require('../utils/collapse-plugins')(plugins);
  }

  // @TODO: does it make sense to also make this an instance method?
  findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  // @TODO: does it make sense to also make this an instance method?
  groupPlugins(plugins) {
    return require('../utils/group-plugins')(plugins, {app: 1, team: 2, global: 3, core: 4});
  }

  async run(config = {}) {
    // just some other identifiers
    config.id = this.config.get('core.id') || config.bin || config.dirname;
    config.product = this.config.get('core.product') || config.bin || config.dirname;

    // set the core debug flag
    config.debug = this.config.get('core.debug');
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
    config.hyperdrive = this.config;
  }
}

module.exports = Bootstrapper;
