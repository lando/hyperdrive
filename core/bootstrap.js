const path = require('path');
const Config = require('./config');
const Plugin = require('./plugin');

class Bootstrapper {
  static findApp(files, startFrom) {
    return require('./../utils/find-app')(files, startFrom);
  }

  static findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  static normalizePlugins(plugins, options = {}) {
    return require('./../utils/normalize-plugins')(plugins, options);
  }

  constructor(options = {}) {
    this.id = options.id || 'lando';
    // the global config
    this.config = new Config(options);
    // debugger
    this.debug = require('debug')(`${this.id}:@lando/core:bootstrap`);
    // just save the options
    this.options = options;
    // a registry of loaded component classes
    this.registry = options.registry || {};
  }

  // helper to get a class
  getClass(component, {cache = true, defaults} = {}) {
    return require('./../utils/get-class')(
      component,
      this.config,
      this.registry,
      {cache, defaults},
    );
  }

  // helper to get a component (and config?) from the registry
  async getComponent(component, constructor = {}, opts = {}) {
    return require('./../utils/get-component')(
      component,
      constructor,
      this.config,
      {cache: opts.cache, defaults: opts.defaults, init: opts.init, registry: this.registry},
    );
  }

  findApp(files, startFrom) {
    return require('../utils/find-app')(files, startFrom);
  }

  // @TODO: does it make sense to also make this an instance method?
  findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  normalizePlugins(plugins, options = {}) {
    return require('../utils/normalize-plugins')(plugins, options);
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

    // add the main config class and instance to the OCLIF config
    config.Config = Config;
    // set Plugin.id
    Plugin.id = 'hyperdrive';

    // Add a way to set the engine

    // @TODO: this has to be config.id because it will vary based on what is using the bootstrap eg lando/hyperdrive
    config[config.id] = {
      bootstrap: this,
      config: this.config,
      getClass: this.getClass,
      getComponent: this.getComponent,
      id: this.id,
      installPlugin: async(name, dest = this.config.get('plugin.global-dir')) => {
        const engine = await this.getComponent('core.engine');
        return Plugin.add(name, dest, engine);
      },
      options: this.options,
      plugins: new Config(),
      Bootstrapper,
      Config,
      Plugin,
    };
  }
}

module.exports = Bootstrapper;
