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

  static normalizePlugins(plugins, by = 'name') {
    return require('./../utils/normalize-plugins')(plugins, by);
  }

  #corePlugins;
  #invalidPlugins;
  #plugins;

  constructor(options = {}) {
    // @NOTE: _plugins is a "faux" internal property meant to hold a list of detected potential plugins
    // use getPlugins() to return a list of resolved and instantiated plugins
    this._plugins = new Config({env: false});

    // the id
    this.id = options.id || 'lando';
    // the global config
    this.config = new Config(options);
    // debugger
    this.debug = require('debug')(`${this.id}:@lando/core:bootstrap`);
    // just save the options
    this.options = options;
    // a registry of loaded component classes
    this.registry = options.registry || {};

    // set the plugin class
    this.Plugin = Plugin;
    Plugin.id = this.id;
  }

  // @TODO: the point of this is to have a high level way to "fetch" a certain kind of plugin eg global and
  // have it return a fully armed and operational instantiated plugin eg has the installer
  async fetchPlugin(plugin, dest = this.config.get('plugin.global-install-dir')) {
    return this.Plugin.fetch(plugin, dest, {
      channel: this.config.get('core.release-channel'),
      installer: await this.getComponent('core.plugin-installer'),
      type: 'global',
    });
  }

  findApp(files, startFrom) {
    return require('../utils/find-app')(files, startFrom);
  }

  // @TODO: does it make sense to also make this an instance method?
  findPlugins(dir, depth = 1) {
    return require('./../utils/find-plugins')(dir, depth);
  }

  normalizePlugins(plugins, by = 'name') {
    return require('../utils/normalize-plugins')(plugins, by);
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

  // helper to return resolved and instantiated plugins eg this should be the list a given context needs
  // @TODO: what other options do we need here?
  async getPlugins({installer = false} = {}) {
    // if we've already done this then return the result
    if (this.#plugins) return this.#plugins;

    // if we get here then we need to do plugin discovery
    this.debug('running %o plugin discovery...', this.id);

    // build some instantiation options
    const options = {channel: this.config.get('core.release-channel')};

    // add the installer to the opts if that is requested
    // @NOTE: is installer false the correct default? seems like it should be since
    //  usually we wont need the installer?
    if (installer) options.installer = await this.getComponent('core.plugin-installer');

    // start by getting and instantiating global plugins
    const globalPlugins = this.config.get('plugin.global-plugin-dirs')
    .map(dir => this.findPlugins(dir.dir, dir.depth))
    .flat(Number.POSITIVE_INFINITY)
    .map(dir => new this.Plugin(dir, {...options, type: 'global'}));

    // debug results of discovery
    this.debug('%o plugin discovery over, results:', this.id);
    this.debug('found %o global plugin(s)', globalPlugins.length);
    this.debug('found %o core plugin(s)', this.#corePlugins.length);

    // separate valid and invalid plugins
    const validGlobalPlugins = globalPlugins.filter(plugin => plugin.isValid);
    this.#invalidPlugins = globalPlugins.filter(plugin => !plugin.isValid);

    // also debug about invalid plugins if we need to
    if (this.#invalidPlugins.length > 0) {
      this.debug('found invalid plugin(s) %o, ignoring', this.#invalidPlugins.map(plugin => plugin.name));
    }

    // construct the plugin store,
    // @NOTE: the order here is important
    const stores = {
      global: this.normalizePlugins(validGlobalPlugins),
      core: this.normalizePlugins(this.#corePlugins),
    };

    // add our new plugins here
    const plugins = new Config();
    // do the priority resolution
    for (const [store, items] of Object.entries(stores)) {
      plugins.add(store, {type: 'literal', store: items});
    }

    // set the internal plugins prop
    this.#plugins = plugins.getUncoded();
    // return
    return this.#plugins;
  }

  // helper to set internal corePlugins prop
  setCorePlugins(plugins) {
    this.#corePlugins = plugins;
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

    // add some other things
    this.Bootstrapper = Bootstrapper;
    this.Config = Config;

    // @TODO: this has to be config.id because it will vary based on what is using the bootstrap eg lando/hyperdrive
    config[config.id] = this;
  }
}

module.exports = Bootstrapper;
