const path = require('path');
const Config = require('./config');

class Bootstrapper {
  constructor(options = {}) {
    this.id = options.id || 'lando';
    // the global config
    this.config = new Config(options);
    // debugger
    this.debug = require('debug')(`${this.id}:@lando/core:bootstrap`);
    // a registry of loaded component classes
    this.registry = options.registry || {};
    // just save the options
    this.options = options;
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

  // helper to get a class
  getClass(component, {config, cache = true, defaults = true} = {}) {
    // first provide some nice handling around "core" components
    // this lets you do stuff like getClass('core.engine') and get whatever that is set to
    // @TODO: move below out into func since its also used in getComponent?
    if (component.split('.')[0] === 'core' && component.split('.').length === 2) {
      component = [component.split('.')[1], this.config.get(component)].join('.');
    }

    // if class is already loaded in registry and cache is true then just return the class
    if (this.registry[component] && cache) {
      this.debug('getting %o from component registry', component);
      return this.registry[component];
    }

    // otherwise load the component from the config
    // @TODO: do we want some better try/catch here?
    const Component = require(this.config.get(`registry.${component}`));

    // and set its defaults if applicable
    if (Component.setDefaults && defaults) {
      const cConfig = this.config.get(component.split('.')[component.split('.').length - 1]);
      Component.setDefaults(config || {...this.config.get('core'), ...cConfig});
    }

    // and set in cache if applicable
    if (cache) {
      this.debug('adding component %o into registry', component);
      this.registry[component] = Component;
    }

    // and return
    return Component;
  }

  // helper to get a component (and config?) from the registry
  async getComponent(component, config, opts = {}) {
    // get class component and instantiate
    const Component = this.getClass(component, opts);
    const instance = new Component(config);

    // @TODO: do init stuff here?
    // and return
    return instance;
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
    // reconcile debug flag
    config.debug = this.config.get('core.debug') || config.debug || false;

    // enable debugging if the config is set
    // @NOTE: this is only for core.debug=true set via the configfile, the --debug turns debugging on before this
    // @TODO: right now you cannot pass in --debug = string and you should be able to
    if (config.debug) require('debug').enable(config.debug === true || config.debug === 1 ? '*' : config.debug);

    // add the main config class to the OCLIF config
    // @TODO: this has to be config.id because it will vary based on what is using the bootstrap eg lando/hyperdrive
    config[config.id] = this.config;
  }
}

module.exports = Bootstrapper;
