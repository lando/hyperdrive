const fs = require('fs');
const path = require('path');
const which = require('which');

const defaultBin = process.platform === 'win32' ? 'lando' : '/usr/local/bin/lando';
const {execSync} = require('child_process');

/**
 *
 */
class Lando {
  /**
   * @TODO: options? channel?
   */
  constructor({bin = defaultBin, releaseChannel = 'stable'} = {}) {
    // independent props
    this.debug = require('debug')('deps:lando');

    // set top level options
    this.bin = path.isAbsolute(bin) ? bin : which.sync('lando', {nothrow: true});
    this.channel = releaseChannel;
    // @TODO: options? channel?
    // this.options = options;

    // compute isInstalled and try to grab config
    this.isInstalled = fs.existsSync(this.bin);
    this.config = this.isInstalled ? this.#load() : {};

    // compute additional properties
    // this.isSupportedVersion =

    // if this.config is not set then run execa to get it

    // then set other stuff with config
    // this.version
    // this.landofile
    // this.landofiles
    // this.pluginDirs
    // this.plugins

    // config props
    // set top level things
    // add some computed properties
    this.updateAvailable = undefined;
    // @TODO: do we need this still
    // this.namespace

    // log
    // const status = this.isValid ? chalk.green('valid') : chalk.red('invalid');
    // this.debug('instantiated %s plugin from %s with options %o', status, this.location);
  }

  // Internal method to help load config
  #load() {
    try {
      return JSON.parse(execSync(`${this.bin} hyperdrive`, {maxBuffer: 1024 * 1024 * 10, encoding: 'utf-8'}));
    } catch {
      this.debug('could not parse output from "%s hyperdrive" correctly');
      return false;
    }
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

module.exports = Lando;
