const crypto = require('crypto');
const fs = require('fs');
const get = require('lodash/get');
const path = require('path');
const slugify = require('slugify');
const yaml = require('yaml');

const parsePkgName = require('../utils/parse-package-name');

const Config = require('../core/config');
const Plugin = require('../core/plugin');

/**
 * @NOTE: the purpose of the minapp is something we can just new MinApp() without a helper async load/init function
 * it should quickly return and give us "all the things we need which is TBD" for hyperdrive that would be
 * just assembling the landofile config, plugins, etc, for lando that might also include being able to exec a command
 * @NOTE: does this min minapp lacks any ASYNC init like engine/plugin etc? what happens when the assembled config is not
 * complete eg has not gone through app init? maybe an init: false prop?
 *
 * @TODO: lots of the config loading makes sense in the constructor EXCEPT for selecting the relevant app component
 * to use, that needs to be done outside of this but how do we do that? probably in the load app util function?
 */
class MinApp {
  static name = 'minapp';
  static cspace = 'minapp';
  static config = {};
  static deps = [
    'core.engine',
    'core.plugin-installer',
  ];

  // landofilestuff
  #landofile
  #landofiles
  #landofileExt

  // plugin stuff
  #corePlugins;
  #invalidPlugins;
  #plugins;

  /**
   * @TODO: options? channel?
   */
  constructor({
    landofile,
    cacheDir = MinApp.config.cacheDir,
    config = {},
    configDir = MinApp.config.configDir,
    dataDir = MinApp.config.dataDir,
    instance = MinApp.config.instance,
    landofiles = MinApp.config.landofiles,
    product = MinApp.config.product,
  } = {}) {
    // @TODO: throw error if no landofile or doesnt exist
    // @TODO: if no name then we should throw an error
    // start by loading in the main landofile and getting the name
    const mainfile = yaml.parse(fs.readFileSync(landofile, 'utf8'));
    this.name = slugify(mainfile.name, {lower: true, strict: true});
    this.root = path.dirname(landofile);
    Config.id = this.name;
    Plugin.id = this.name;
    this.Config = Config;
    this.Plugin = Plugin;

    // set other props that are name-dependent
    this.cacheDir = path.join(cacheDir, 'apps', this.name);
    this.configDir = path.join(configDir, 'apps', this.name);
    this.dataDir = path.join(dataDir, 'apps', this.name);
    this.logsDir = path.join(this.dataDir, 'logs');
    this.pluginsDir = path.join(this.root, '.lando', 'plugins');
    this.debug = require('debug')(`${this.name}:@lando/core:minapp`);
    this.env = `${product}-${this.name}`.toUpperCase().replace(/-/gi, '_');
    this.id = slugify(crypto.createHash('sha1').update(`${landofile}:${this.name}`).digest('base64'));
    this.instance = instance;
    this.registry = [];

    // private props
    this.#landofileExt = landofile.split('.').pop();
    this.#landofile = path.basename(landofile, `.${this.#landofileExt}`);
    // @NOTE: landofiles can only be overridden in the main landofile for, i hope, obvious reasons
    this.#landofiles = this.getLandofiles(get(mainfile, 'config.core.landofiles', landofiles));

    // created needed dirs
    for (const dir of [this.cacheDir, this.configDir, this.dataDir, this.logsDir, this.pluginsDir]) {
      fs.mkdirSync(path.dirname(dir), {recursive: true});
      this.debug('ensured directory %o exists', dir);
    }

    // build the app config by loading in the apps
    this.appConfig = new Config({
      cached: path.join(this.cacheDir, 'landofiles.json'),
      managed: 'main',
      env: this.env,
      id: this.name,
      sources: Object.fromEntries(this.#landofiles.map(landofile => ([landofile.type, landofile.path]))),
    });

    // separate out the config and mix in the global ones
    // @TODO: what other props should we include in here?
    const appStuff = {name: this.name, location: this.root};
    this.config = new Config({id: this.name});
    this.config.add('app', {type: 'literal', store: {app: appStuff, ...this.appConfig.getUncoded('config')}});
    this.config.add(product, {type: 'literal', store: config});
  }

  // @TODO: the point of this is to have a high level way to "fetch" a certain kind of plugin eg global and
  // have it return a fully armed and operational instantiated plugin eg has the installer
  async addPlugin(name, dest = this.pluginsDir) {
    // attempt to add the plugin
    const plugin = await this.Plugin.fetch(name, dest, {
      channel: this.config.get('core.release-channel'),
      installer: await this.getComponent('core.plugin-installer'),
      type: 'app',
    });

    // try to figure out the source to drop into the landofile
    const request = parsePkgName(name);
    const source = request.peg ? request.peg : `^${plugin.version}`;
    // modify the landofile with the updated plugin
    this.appConfig.save({plugins: {[plugin.name]: source}});

    // reset the plugin cache
    this.#plugins = undefined;
    this.#invalidPlugins = undefined;
    // return the plugin
    return plugin;
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

  getLandofiles(files = []) {
    return files
    // assemble the filename/type
    .map(type => ({
      filename: type === '' ? `${this.#landofile}.${this.#landofileExt}` : `${this.#landofile}.${type}.${this.#landofileExt}`,
      type: type === '' ? 'main' : type,
    }))
    // get the absolute paths
    .map(landofile => ({type: landofile.type, path: path.join(this.root, landofile.filename)}))
    // filter out ones that dont exist
    .filter(landofile => fs.existsSync(landofile.path))
    // merge in includes
    .map(landofile => {
      // see if we have any includes
      const includes = get(yaml.parse(fs.readFileSync(landofile.path, 'utf8')), 'includes');
      if (includes) {
        const landofiles = this.getLandofiles((typeof includes === 'string') ? [includes] : includes);
        return [...landofiles, landofile];
      }

      // otherwise arrify and return
      return [landofile];
    })
    // flatten
    .flat(Number.POSITIVE_INFINITY);
  }

  getPlugin(name) {
    // strip any additional metadata and return just the plugin name
    const data = parsePkgName(name);
    // @TODO: do we want to throw an error if not found?
    return this.getPlugins()[data.name];
  }

  // @TODO: we probably will also need dirs for core plugins for lando
  // @TODO: we probably will also need a section for "team" plugins
  getPlugins(options = {}) {
    // if we've already done this then return the result
    if (this.#plugins) return this.#plugins;
    // if we get here then we need to do plugin discovery
    this.debug('running app plugin discovery...');

    // before we do the discovery we need to check to see if we have any
    // local app plugins
    const localAppPlugins = Object.entries(this.appConfig.getUncoded('plugins'))
    .filter(plugin => fs.existsSync(path.join(this.root, plugin[1])))
    .map(plugin => new this.Plugin(path.join(this.root, plugin[1]), {type: 'app', ...options}));

    // do the discovery
    const {plugins, invalids} = require('../utils/get-plugins')(
      [
        {store: 'app', plugins: localAppPlugins, dirs: [{dir: this.pluginsDir, depth: 2}]},
        {store: 'global', dirs: this.config.get('plugin.global-plugin-dirs')},
        {store: 'core', plugins: this.#corePlugins},
      ],
      this.Plugin,
      {channel: this.config.get('core.release-channel'), ...options},
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
    if (plugin.type !== 'app') throw new Error(`${plugin.name} is a ${plugin.type} plugin and cannot be removed from here`);
    // throw error if this is a local app plugin
    if (plugin.location !== path.join(this.pluginsDir, plugin.name)) {
      throw new Error('cannot remove local app plugins, please remove manually');
    }

    // if we get here then remove the plugin
    plugin.remove();
    // and remove it from the landofile
    this.appConfig.remove(`plugins.${plugin.name}`);

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
}

module.exports = MinApp;
