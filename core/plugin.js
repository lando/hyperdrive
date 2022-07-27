const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 *
 */
class Plugin {
  /**
   * @TODO: scripts shoudl be moved into the engine constructor
   */
  constructor({dir, id, type = 'app', releaseChannel = 'stable'} = {}) {
    // core props
    this.location = dir;
    this.type = type;
    this.channel = releaseChannel;
    // config props
    this.pjson = require(path.join(dir, 'package.json'));
    this.config = {...this.pjson.lando, ...this.#load()};
    // set top level things
    this.name = this.config.name || this.pjson.name;
    this.debug = require('debug')(`${id}:@lando/core:plugin:${this.name}`);
    this.package = this.pjson.name;
    this.version = this.pjson.version;
    // add some computed properties
    this.isInstalled = true;
    this.isValid = Object.keys(this.config).length > 0;
    this.updateAvailable = undefined;
    // @TODO: do we need this still
    // this.namespace
    // this.config.core.engine
    this.engine = this.config.bootstrap.getComponent('engine.docker-engine');

    // log
    const status = this.isValid ? chalk.green('valid') : chalk.red('invalid');
    this.debug('instantiated %s plugin from %s', status, this.location);
  }

  // Internal method to help load config
  // @TODO: we might want to put more stuff in here at some point.
  // @NOTE: this will differ from "init" which should require in all needed files?
  #load() {
    const {location, options} = this;
    // return the plugin.js return first
    if (fs.existsSync(path.join(location, 'plugin.js'))) return require(path.join(location, 'plugin.js'))(options);
    // otherwise return the plugin.yaml content
    if (fs.existsSync(path.join(location, 'plugin.yaml'))) return yaml.load(fs.readFileSync(path.join(location, 'plugin.yaml'), 'utf8'));
    // otherwise return the plugin.yml content
    if (fs.existsSync(path.join(location, 'plugin.yml'))) return yaml.load(fs.readFileSync(path.join(location, 'plugin.yml'), 'utf8'));
    // otherwise return uh, nothing?
    return {};
  }

  /**
   *
   * Install a plugin.
   *
   * @todo: Some (or all) of this may belong in the engine object.
   * @todo: Get rid of scripts...bootstrapped config?
   *
   * @param {string} name Valid name/version string for NPM to fetch the plugin.
   * @param {string} dest The plugin directory to install the plugin in.
   * @returns
   */
  static async add(name, dest, scripts, engine) {
    const mkdirp = require('mkdirp');
    const nameVersion = this.mungeVersion(name);
    const pluginPath = `${dest}/${nameVersion.name}`;

    // @todo: move the removing of the old plugin to after the plugin install; possibly run inside the Docker script.
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, {recursive: true});
    }

    mkdirp.sync(pluginPath);
    const plugin = {
      ...nameVersion,
      scripts: scripts,
      path: pluginPath
    };
    const run = engine.addPlugin(plugin);
  }

  async add() {
    // @todo: move the removing of the old plugin to after the plugin install; possibly run inside the Docker script.
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, {recursive: true});
    }

    mkdirp.sync(this.path);
    const run = this.engine.addPlugin(this);
    run[1].attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
      console.log(err, stream);
      stream.on('data', buffer => {
        const debug = require('debug')(`add-${this.name}:@lando/hyperdrive`);
        debug(String(buffer));
      });
    });
    return run;
  }

  /**
   *
   * Separate a provided plugin's name and version strings.
   *
   * @param {string} name A string containing the name and optional version info for a plugin.
   */
  static mungeVersion(name) {
    let nameVersion = {};
    nameVersion.version = name.match('(?:[^@]*@\s*){2}(.*)');
    if (nameVersion.version === null) {
      nameVersion.version = '';
      nameVersion.name = name;
    } else {
      nameVersion.version = nameVersion.version[1];
      nameVersion.name = name.replace(`@${nameVersion.version}`, '');
    }
    return nameVersion;
  }

  static async info(name) {
    const {manifest} = require('pacote');
    const nameVersion = this.mungeVersion(name);
    const config = {
      fullMetadata: true,
      preferOnline: true,
    };
    const info = await manifest(name, config);
    return this.formatInfo(nameVersion.name, info);
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
   * Format info returned from pacote to our desired info() elements.
   *
   * @param {string} name Name of the plugin.
   * @param {object} info Return output from pacote.
   * @returns {object}    Formatted plugin info.
   */
  static formatInfo(name, info) {
    return {
      // MVP plugin.yml
      name: name,
      description: info.description,
      releaseNotesUrl: 'https://URL/to/CHANGELOG.yml',
      // @todo: should we query for this?
      // installedVersion: this.isInstalled ? this.version : 'Not Installed',
      version: info.version,
      repositoryUrl: info.repository,
      author: info.author,
      contributors: info.maintainers,
      keywords: info.keywords,
    };
  }

  // update(version) {

  // }

  /**
   * Remove a plugin.
   *
   */
  remove() {
    return fs.rmSync(this.path, {recursive: true});
  }

  // update(version) {

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

module.exports = Plugin;
