const crypto = require('crypto');
const fs = require('fs');
const get = require('lodash/get');
const path = require('path');
const slugify = require('slugify');
const yaml = require('yaml');

const Config = require('./../core/config');
const Plugin = require('./plugin');

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
  // private props
  #landofile
  #landofiles
  #landofileExt

  /**
   * @TODO: options? channel?
   */
  constructor({
    landofile,
    cacheDir = MinApp.defaults.cacheDir,
    config = {},
    configDir = MinApp.defaults.configDir,
    dataDir = MinApp.defaults.dataDir,
    instance = MinApp.defaults.instance,
    landofiles = MinApp.defaults.landofiles,
    plugins = {},
    product = MinApp.defaults.product,
  } = {}) {
    // @TODO: throw error if no landofile or doesnt exist
    // @TODO: if no name then we should throw an error
    // start by loading in the main landofile and getting the name
    const mainfile = yaml.parse(fs.readFileSync(landofile, 'utf8'));
    this.name = slugify(mainfile.name, {lower: true, strict: true});
    this.root = path.dirname(landofile);

    // set other props that are name-dependent
    this.cacheDir = path.join(cacheDir, 'apps', this.name);
    this.configDir = path.join(configDir, 'apps', this.name);
    this.dataDir = path.join(dataDir, 'apps', this.name);
    this.debug = require('debug')(`${this.name}:@lando/core:minapp`);
    this.env = `${product}-${this.name}`.toUpperCase().replace(/-/gi, '_');
    this.id = slugify(crypto.createHash('sha1').update(`${landofile}:${this.name}`).digest('base64'));
    this.instance = instance;

    // private props
    this.#landofileExt = landofile.split('.').pop();
    this.#landofile = path.basename(landofile, `.${this.#landofileExt}`);
    // @NOTE: landofiles can only be overridden in the main landofile for, i hope, obvious reasons
    this.#landofiles = this.getLandofiles(get(mainfile, 'config.core.landofiles', landofiles));

    // created needed dirs
    for (const dir of [this.cacheDir, this.configDir, this.dataDir]) {
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

    // separate out the plugins and mix in global ones
    const appPlugins = this.normalizePlugins(this.appConfig.getUncoded('plugins'));
    this.plugins = new Config({id: this.name});
    this.plugins.add('app', {type: 'literal', store: appPlugins});
    this.plugins.add(product, {type: 'literal', store: plugins});

    // separate out the config and mix in the global ones
    // @TODO: what other props should we include in here?
    const appStuff = {name: this.name, location: this.root};
    this.config = new Config({id: this.name});
    this.config.add('app', {type: 'literal', store: {app: appStuff, ...this.appConfig.get('config')}});
    this.config.add(product, {type: 'literal', store: config});
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

  normalizePlugins(plugins = {}) {
    const normalizedPlugins = Object.entries(plugins)
    .map(entry => {
      const name = entry[0];
      const data = entry[1];
      // compute some defaults
      const location = path.join(this.root, '.plugins', name);
      const defaults = (typeof data === 'object') ? {location, ...data} : {location};

      // override defaults as needed if we have data set as string
      if (typeof data === 'string') {
        if (fs.existsSync(path.join(this.root, data))) defaults.location = path.join(this.root, data);
        else defaults.version = data;
      }

      // at this point we should have an object and we should merge over default values
      const plugin = new Plugin({name, type: 'app', ...defaults});
      return [name, {name, ...defaults, ...plugin.getStripped()}];
    });

    // return objectification
    return Object.fromEntries(normalizedPlugins);
  }
}

MinApp.defaults = {};
module.exports = MinApp;
