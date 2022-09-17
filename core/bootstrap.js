const path = require('path');
const Config = require('./config');
const Plugin = require('./plugin');

class Bootstrapper {
  static findApp(files, startFrom) {
    return require('../utils/find-app')(files, startFrom);
  }

  static findPlugins(dir, depth = 1) {
    return require('../utils/find-plugins')(dir, depth);
  }

  static normalizePlugins(plugins, by = 'name') {
    return require('../utils/normalize-plugins')(plugins, by);
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

    // add some helper classes
    Plugin.id = this.id;
    this.Plugin = Plugin;
    this.Bootstrapper = Bootstrapper;
    this.Config = Config;
  }

  // @TODO: the point of this is to have a high level way to "fetch" a certain kind of plugin eg global and
  // have it return a fully armed and operational instantiated plugin eg has the installer
  async addPlugin(name, dest = this.config.get('plugin.global-install-dir')) {
    // attempt to add the plugin
    const plugin = await this.Plugin.fetch(name, dest, {
      channel: this.config.get('core.release-channel'),
      installer: await this.getComponent('core.plugin-installer'),
      type: 'global',
    });
    // reset the plugin cache
    this.#plugins = undefined;
    this.#invalidPlugins = undefined;
    // return the plugin
    return plugin;
  }

  findApp(files, startFrom) {
    return require('../utils/find-app')(files, startFrom);
  }

  // @TODO: does it make sense to also make this an instance method?
  findPlugins(dir, depth = 1) {
    return require('../utils/find-plugins')(dir, depth);
  }

  normalizePlugins(plugins, by = 'name') {
    return require('../utils/normalize-plugins')(plugins, by);
  }

  // helper to get a class
  getClass(component, {cache = true, defaults} = {}) {
    return require('../utils/get-class')(
      component,
      this.config,
      this.registry,
      {cache, defaults},
    );
  }

  // helper to get a component (and config?) from the registry
  async getComponent(component, constructor = {}, opts = {}) {
    return require('../utils/get-component')(
      component,
      constructor,
      this.config,
      {cache: opts.cache, defaults: opts.defaults, init: opts.init, registry: this.registry},
    );
  }

  getPlugin(name) {
    // strip any additional metadata and return just the plugin name
    const data = require('../utils/parse-package-name')(name);
    // @TODO: do we want to throw an error if not found?
    return this.getPlugins()[data.name];
  }

  // helper to return resolved and instantiated plugins eg this should be the list a given context needs
  // @TODO: we probably will also need dirs for core plugins for lando
  // @TODO: we probably will also need a section for "team" plugins
  getPlugins(options = {}) {
    // if we've already done this then return the result
    if (this.#plugins) return this.#plugins;
    // if we get here then we need to do plugin discovery
    this.debug('running %o plugin discovery...', this.id);

    // do the discovery
    const {plugins, invalids} = require('../utils/get-plugins')(
      [
        {store: 'global', dirs: this.config.get('plugin.global-plugin-dirs')},
        {store: 'core', plugins: this.#corePlugins},
      ],
      this.Plugin,
      {channel: this.config.get('core.release-channel'), ...options, type: 'global'},
    );

    // set things
    this.#plugins = plugins;
    this.#invalidPlugins = invalids;
    // return
    return this.#plugins;
  }

  // helper to remove a plugin
  removePlugin(name) {
    // map plugin name to object
    const plugin = this.getPlugin(name);

    // throw error if there is no plugin to remove
    if (!plugin) throw new Error(`could not find a plugin called ${name}`);
    // throw error if plugin is a core plugin
    if (plugin.type === 'core') throw new Error(`${plugin.name} is a core plugin and cannot be removed`);

    // if we get here then remove the plugin
    plugin.remove();
    // reset cache
    this.#plugins = undefined;
    this.#invalidPlugins = undefined;
    // return the plugin
    return plugin;
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

    // @TODO: this has to be config.id because it will vary based on what is using the bootstrap eg lando/hyperdrive
    config[config.id] = this;
  }
}

module.exports = Bootstrapper;
