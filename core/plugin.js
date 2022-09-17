const chalk = require('chalk');
const debug = require('debug')('static@lando/core:plugin');
const fs = require('fs-extra');
const has = require('lodash/has');
const makeError = require('../utils/make-error');
const os = require('os');
const path = require('path');
const parsePkgName = require('../utils/parse-package-name');
const yaml = require('yaml');

/**
 *
 */
class Plugin {
  static id = 'lando';
  static installer;

  /**
   * fetches a plugin from a registry/git repo
   */
  static async fetch(plugin, dest = os.tmpdir(), {
    channel = 'stable',
    installer = Plugin.installer,
    type = 'app',
  } = {}) {
    // mods
    const {extract} = require('pacote');
    const {nanoid} = require('nanoid');

    // parse the package name
    const pkg = parsePkgName(plugin, {defaultTag: channel});
    // get the info so we can determine whether this is a lando package or not
    const {_id, name} = await Plugin.info(pkg.raw, {channel});

    // update dest with info
    dest = path.join(dest, name);

    // make sure we have a place to extract the plugin
    const tmp = path.join(os.tmpdir(), nanoid());
    fs.mkdirSync(tmp, {recursive: true});

    // try to extract the plugin
    const {resolved} = await extract(pkg.raw, tmp);
    debug('extracted plugin %o to %o from %o', _id, tmp, resolved);

    // if we get this far then we can safely move the plugin to dest
    fs.rmSync(dest, {recursive: true, force: true});
    fs.mkdirSync(dest, {recursive: true});
    fs.copySync(tmp, dest);
    debug('moved plugin from %o to %o', tmp, dest);

    // return instantiated plugin
    return new Plugin(dest, {channel, installer, type});
  }

  /**
   *
   * TBD
   */
  static async info(plugin, {channel = 'stable'} = {}) {
    // mods
    const {manifest} = require('pacote');

    // @TODO: release channel handling
    // if the plugin has a non-standard release channel then we need to figure out the correct tag to pull
    // basically it should be the higher versioned tag between latest and edge

    // parse the plugin name
    const pkg = parsePkgName(plugin, {defaultTag: channel});

    // try to get info about the package
    try {
      // @TODO: how do we auth?
      const info = await manifest(pkg.raw, {fullMetadata: true, preferOnline: true});
      debug('retrieved plugin information for %o from %o', pkg.raw, info._resolved);

      // if not a "lando plugin" then throw an error
      if (!info.lando && !info.keywords.includes('lando-plugin')) {
        const error = new Error(`${pkg.raw} does not seem to be a valid plugin.`);
        error.ref = 'docs to plugin requirements dev page';
        error.suggestions = ['tbd'];
        throw error;
      }

      return info;

    // handle errors
    } catch (error) {
      // better 404 message
      if (error.statusCode === 404) error.message = `could not find a plugin called ${pkg.raw}`;
      // throw
      throw makeError({error});
    }
  }

  /**
   * Format info returned from pacote to our desired info() elements.
   *
   * @param {string} name Name of the plugin.
   * @param {object} info Return output from pacote.
   * @returns {object}    Formatted plugin info.
   */
  // static formatInfo(name, info) {
  //   return {
  //     // MVP plugin.yml
  //     name: name,
  //     description: info.description,
  //     releaseNotesUrl: 'https://URL/to/CHANGELOG.yml',
  //     // @todo: should we query for this?
  //     // installedVersion: this.isInstalled ? this.version : 'Not Installed',
  //     version: info.version,
  //     repositoryUrl: info.repository,
  //     author: info.author,
  //     contributors: info.maintainers,
  //     keywords: info.keywords,
  //   };
  // }

  /**
   * @TODO: scripts shoudl be moved into the engine constructor
   */
  constructor(location, {
    channel = 'stable',
    id = Plugin.id || 'lando',
    installer = Plugin.installer,
    type = 'app',
  } = {}) {
    // core props
    this.root = location;
    this.channel = channel;
    this.installer = installer;
    this.type = type;

    // throw error if plugin does not seem to exist
    if (!fs.existsSync(path.join(this.root, 'package.json'))) throw new Error(`Could not find a plugin in ${this.root}`);

    // set top level things
    this.location = this.root;
    this.pjson = require(path.join(this.root, 'package.json'));
    this.config = {...this.pjson.lando, ...this.#load()};
    this.name = this.config.name || this.pjson.name;
    this.nm = path.join(this.root, 'node_modules');
    this.debug = require('debug')(`${id}:@lando/core:plugin:${this.name}`);
    this.package = this.pjson.name;
    this.updateAvailable = undefined;
    this.version = this.pjson.version;

    // add some computed properties
    // @TODO: this.attached? this.detached?
    this.isInstalled = false;
    this.isValid = false ||
      Object.keys(this.config).length > 0 ||
      has(this.pjson, 'lando') ||
      (this.pjson.keywords && this.pjson.keywords.includes('lando-plugin'));

    // if the plugin does not have any dependencies then consider it installed
    // @TODO: what about dev deps?
    if (!this.pjson.dependencies || Object.keys(this.pjson.dependencies).length === 0) {
      this.isInstalled = true;
    }

    // if plugin has a non-empty node_modules folder then consider it installed
    // @NOTE: is this good enough?
    if (fs.existsSync(this.nm) && fs.readdirSync(this.nm).length > 0) {
      this.isInstalled = true;
    }

    // log result
    const validStatus = this.isValid ? chalk.green('valid') : chalk.red('invalid');
    const installStatus = this.isInstalled ? chalk.green('installed') : chalk.yellow('uninstalled');
    this.debug('instantiated %s and %s plugin from %s', validStatus, installStatus, this.root);
  }

  // Internal method to help load config
  // @TODO: we might want to put more stuff in here at some point.
  // @NOTE: this will differ from "init" which should require in all needed files?
  // @TODO: we might want to replace this with Config?
  // @TODO: how will plugin config merge with the global/app config?
  #load() {
    const {root, options} = this;
    // return the plugin.js return first
    if (fs.existsSync(path.join(root, 'plugin.js'))) return require(path.join(root, 'plugin.js'))(options);
    // otherwise return the plugin.yaml content
    if (fs.existsSync(path.join(root, 'plugin.yaml'))) return yaml.parse(fs.readFileSync(path.join(root, 'plugin.yaml'), 'utf8'));
    // otherwise return the plugin.yml content
    if (fs.existsSync(path.join(root, 'plugin.yml'))) return yaml.parse(fs.readFileSync(path.join(root, 'plugin.yml'), 'utf8'));
    // otherwise return uh, nothing?
    return {};
  }

  async info() {
    const {manifest} = require('pacote');
    const query = `${this.name}@${this.version}`;
    const config = {
      fullMetadata: true,
      preferOnline: true,
    };
    const info = await manifest(query, config);
    return this.formatInfo(this.name, info);
  }

  /**
   *
   * Install a plugin.
   */
  async install({installer = this.installer || Plugin.installer} = {}) {
    // try teh install
    await installer.installPlugin(this.root, this.config.installer);
    // if we get here then we can update isInstalled
    this.isInstalled = true;
  }

  /**
   * Remove a plugin.
   */
  remove() {
    return fs.rmSync(this.root, {recursive: true, force: true});
  }
}

module.exports = Plugin;
