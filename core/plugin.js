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
  constructor(dir, options = {}) {
    // @TODO: should we break this.options up into relevant things eg this.channel = options.channel || 'stable'?
    // core props
    this.location = dir;
    this.options = options;
    // config props
    this.pjson = require(path.join(dir, 'package.json'));
    this.config = {...this.pjson.lando, ...this.#load()};
    // set top level things
    this.name = this.config.name || this.pjson.name;
    this.debug = require('debug')(`plugin:${this.name}`);
    this.package = this.pjson.name;
    this.version = this.pjson.version;
    // add some computed properties
    this.isInstalled = true;
    this.isValid = Object.keys(this.config).length > 0;
    this.updateAvailable = undefined;
    // @TODO: do we need this still
    // this.namespace
    this.debug('instantiated plugin from %s with options %o', this.location, options);
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

  // static async add(name, dest) {

  // }

  // static async info(name) {

  // }

  // async info() {
  //   // uses this.name
  // }

  // update(version) {

  // }

  // /*
  //  * Install a plugin.
  //  */
  // async add() {
  //   const {execa} = await import('execa'); // eslint-disable-line node/no-unsupported-features/es-syntax
  //   // @todo: move the removing of the old plugin to after the plugin install; possibly run inside the Docker script.
  //   if (fs.existsSync(this.path)) {
  //     fs.rmSync(this.path, {recursive: true});
  //   }

  //   mkdirp.sync(this.path);
  //   const run = execa('docker', ['run', '--rm', '-v', `${this.path}:/plugins/${this.pluginName}`, '-v', `${this.scripts}:/scripts`, '-w', '/tmp', 'node:14-alpine', 'sh', '-c', `/scripts/add.sh ${this.pluginName}`]);
  //   run.stdout.on('data', buffer => {
  //     const debug = require('debug')(`add-${this.pluginName}:@lando/hyperdrive`);
  //     debug(String(buffer));
  //   });
  //   return run;
  // }

  /**
   * Remove a plugin.
   *
   */
  remove() {
    return fs.rmSync(this.path, {recursive: true});
  }

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
