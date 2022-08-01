const path = require('path');
const Config = require('./config');

class Bootstrapper {
  constructor(options = {}) {
    this.config = new Config(options);
    this.options = options;
    this.registry = options.registry || 'registry';
  }

  static collapsePlugins(plugins) {
    return require('../utils/collapse-plugins')(plugins);
  }

  static findApp(files, startFrom) {
    return require('../utils/find-app')(files, startFrom);
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
    // @TODO try/catch here? for better error stuff +++
    // @TODO move this into utils and ref like others

    // first provide some nice handling around "core" components
    // this lets you do stuff like getComponent('core.engine') and get whatever that is set to
    if (component.split('.')[0] === 'core' && component.split('.').length === 2) {
      component = [component.split('.')[1], this.config.get(component)].join('.');
    }

    // @TODO: it would be better to return a more legit name than Component?
    const Component = require(this.config.get(`${registry}.${component}`));
    const cckey = config || component.split('.')[component.split('.').length - 1];
    return [Component, this.config.get(cckey)];
  }

  collapsePlugins(plugins) {
    return require('../utils/collapse-plugins')(plugins);
  }

  findApp(files, startFrom) {
    return require('../utils/find-app')(files, startFrom);
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
    // get an id
    config.id = this.config.get('core.id') || this.config.get('core.id') || config.bin || path.basename(process.argv[1]);
    // set core debug flag
    this.config.set('core.debug', config.debug);
    // enable debugging if the config is set
    // @NOTE: this is only for core.debug=true set via the configfile, the --debug turns debugging on before this
    if (config.debug) require('debug').enable(config.debug === true ? '*' : config.debug);

    // add the main config class to the OCLIF config
    // @TODO: this has to be config.id because it will vary based on what is using the bootstrap eg lando/hyperdrive
    config[config.id] = this.config;
  }
}

module.exports = Bootstrapper;
