const path = require('path');
const Config = require('./config');

class Bootstrapper {
  static findApp(files, startFrom) {
    return require('../utils/find-app')(files, startFrom);
  }

  static findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  // assemble app configuration using ordered list of files
  // static getAppConfig(dir, depth = 1) {

  // }

  static normalizePlugins(plugins, options = {}) {
    return require('../utils/normalize-plugins')(plugins, options);
  }

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
    if (defaults) {
      const namespace = Component.cspace || Component.name || component.split('.')[component.split('.').length - 1];
      Component.defaults = config || {...this.config.get('system'), ...this.config.get('core'), ...this.config.get(namespace)};
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
  async getComponent(component, constructor = {}, init = true, opts = {}) {
    // get class component and instantiate
    const Component = this.getClass(component, opts);
    const instance = Array.isArray(constructor) ? new Component(...constructor) : new Component(constructor);

    // and run its init func if applicable
    if (instance.init && typeof instance.init === 'function' && init) {
      await instance.init(constructor, opts);
    }

    // and return
    return instance;
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
    // @TODO: this has to be config.id because it will vary based on what is using the bootstrap eg lando/hyperdrive
    config[config.id] = {
      bootstrap: this,
      config: this.config,
      getClass: (component, opts) => {
        return Reflect.apply(this.getClass, this, [component, opts]);
      },
      getComponent: (component, config, opts) => {
        return Reflect.apply(this.getComponent, this, [component, config, opts]);
      },
      id: this.id,
      options: this.options,
      plugins: new Config({decode: false}),
      registry: this.registry,
      Bootstrapper,
      Config,
    };
  }
}

module.exports = Bootstrapper;
