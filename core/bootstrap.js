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
  async fetchPlugin(plugin, dest = this.config.get('plugin.global-dir')) {
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

  // helper to return resolved and instantiated plugings eg this should be the list a given context needs
  // to load/init
  getPlugins() {
    // go through the stores and transform them into plugin objects keyed by name
    // @TODO: move this out into its own function?
    const stores = Object.fromEntries(Object.entries(this._plugins.stores)
    .map(store => ([store[0], store[1] && store[1].store]))
    .map(store => {
      // map into plugin objects but skip core since
      // @TODO: add in things like manifest?
      const plugins = Object.entries(store[1])
      .map(item => item[1])
      .map(item => item.type === 'core' ? item : new this.Plugin(item.location, {type: item.type}));

      // return
      return [store[0], Object.fromEntries(plugins.map(plugin => [plugin.name, plugin]))];
    }));

    // add our new plugins here
    const plugins = new Config();
    // do the priority resolution
    for (const [store, items] of Object.entries(stores)) {
      plugins.add(store, {type: 'literal', store: items});
    }

    // return
    return plugins.getUncoded();
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
    config[config.id] = {
      _plugins: this._plugins,
      bootstrap: this,
      config: this.config,
      fetchPlugin: this.fetchPlugin,
      getClass: this.getClass,
      gCls: this.getClass,
      getComponent: this.getComponent,
      gCpt: this.getComponent,
      getPlugins: this.getPlugins,
      id: this.id,
      options: this.options,
      Bootstrapper,
      Config,
      Plugin: this.Plugin,
    };
  }
}

module.exports = Bootstrapper;
