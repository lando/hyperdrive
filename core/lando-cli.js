const chalk = require('chalk');
const findPlugins = require('./../utils/find-plugins');
const fs = require('fs');
const path = require('path');
const which = require('which');

const {execSync} = require('child_process');
const {satisfies} = require('semver');

const Plugin = require('./plugin');

const defaultBin = process.platform === 'win32' ? 'lando' : '/usr/local/bin/lando';
const execSyncOpts = {maxBuffer: 1024 * 1024 * 10, encoding: 'utf-8'};

/**
 *
 */
class LandoCLI {
  /**
   * @TODO: options? channel?
   */
  constructor({bin = defaultBin, releaseChannel = 'stable', id, installDefault, requiredVersion} = {}) {
    // set top level props
    this.debug = require('debug')(`${id}:@lando/core:deps:lando-cli`);
    this.bin = path.isAbsolute(bin) ? bin : which.sync('lando', {nothrow: true});
    this.channel = releaseChannel;
    this.installDefault = installDefault;
    this.requiredVersion = requiredVersion;

    // props to determine status
    this.isInstalled = fs.existsSync(this.bin);
    this.version = this.isInstalled ? this.#getVersion() : undefined;
    this.isSupported = this.isInstalled &&  satisfies(this.version, this.requiredVersion);

    // get config directly from lando if we can
    const config = this.isSupported ? this.#load() : {};
    // set the relevant lando config hyperdrive needs
    this.landofile = config.landofile || '.lando';
    this.landofiles = config.landofiles ? config.landofiles.map(file => `${this.landofile}${file}`) : [this.landofile];
    this.pluginDirs = config.pluginDirs || [];

    // discover other plugins
    const otherPlugins = this.pluginDirs
    .filter(dir => dir.type !== 'core')
    .map(dir => ({type: dir.type, dirs: findPlugins(dir.dir, dir.depth)}))
    .map(dirs => dirs.dirs.map(dir => new Plugin({dir, id: 'lando-cli', type: dirs.type})))
    .flat(Number.POSITIVE_INFINITY);
    // concat all plugins together
    this.plugins = [...config.plugins, ...otherPlugins];

    // additional props
    this.updateAvailable = undefined;

    // log
    const status = this.isSupported ? chalk.green('supported') : chalk.red('not supported');
    this.debug('instantiated lando-cli version %s (%s), using %s', this.version, status, this.bin);
  }

  // Internal method to help load config
  #getVersion() {
    try {
      return execSync(`${this.bin} version`, execSyncOpts).trim().slice(1);
    } catch {
      this.debug('could not parse output from "%s version" correctly');
      return false;
    }
  }

  // Internal method to help load config
  #load() {
    try {
      return JSON.parse(execSync(`${this.bin} hyperdrive`, execSyncOpts));
    } catch {
      this.debug('could not parse output from "%s hyperdrive" correctly');
      return false;
    }
  }

  // helper to return plugins optionally by type
  getPlugins(type) {
    if (type) return this.plugins.filter(plugin => plugin.type === type);
    return this.plugins;
  }

  /**
   *
   * Installs lando
   */
  // static async install() {
  // }

  /**
   *
   * Separate a provided plugin's name and version strings.
   *
   * @param {string} name A string containing the name and optional version info for a plugin.
   */
  async update(name) {
    let nameVersion = {};
    nameVersion.version = name.slice(1).match('([^@]+$)')[0];
    nameVersion.name = name.replace(`@${nameVersion.version}`, '');
    return nameVersion;
  }

  // static async info(name) {

  // }

  // async info() {
  //   // uses this.name
  // }

  /**
   * Remove lando?
   *
   */
  // uninstall() {
  // }

  /**
   * Get metadata on a plugin.
   *
   */
  // async info() {
  //   const {manifest} = require('pacote');
  //   // const opts = {
  //   // Integrate config file npm section that allows you to define npmrc options to pass in to here/other npm-related commands.
  //   // npm-registry-fetch commands: https://www.npmjs.com/package/npm-registry-fetch
  //   // npm config: https://docs.npmjs.com/cli/v8/using-npm/config
  //   /*       registry: '',
  //   agent: this.config['user-agent'],
  //   gzip: 'does not exist',
  //   headers: 'does not exist',
  //   ignoreBody: 'does not exist',
  //   integrity: 'does not exist',
  //   mapJSON: 'does not exist',
  //   maxSockets: this.config['maxsockets'],
  //   method: 'does not exist',
  //   npmSession: 'does not exist',
  //   npmCommand: 'does not exist',
  //   otpPrompt: 'does not exist; maybe want a default function here?',
  //   // Basic auth password...I'm not sure if this is supported in modern npm config
  //   password: this.config['_auth'],
  //   query: 'does not exist',
  //   retry: 'does not exist; this is just an object-value alternative to pass in values provided a single properties by config...not needed',
  //   spec: 'does not exist',
  //   timeout: this.config['fetch-timeout'],
  //   // I think this is the correct mapping
  //   _authToken: this.config['_auth'],
  //   username: 'does not exist; believe basic auth is not supported in modern npm config',
  //   */
  //   // This is the format required for authing with an authtoken...maybe put this in a demo config file.
  //   //  '//<npm.pkg.github.com>/:_authToken': 'THE AUTH TOKEN',
  //   // };
  //   const query = `${this.pluginName}@${this.version}`;
  //   const config = {
  //     fullMetadata: true,
  //     preferOnline: true,
  //   };
  //   const info = await manifest(query, config);

  //   return {
  //     // MVP plugin.yml
  //     name: this.pluginName,
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
}

module.exports = LandoCLI;
