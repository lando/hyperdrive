const fs = require('fs');
const mkdirp = require('mkdirp');

/**
 *
 */
class Plugin {
  /**
   *
   * @param {string} plugin  The name of the plugin to install.
   * @param {string} root    Location of the plugin on my computer...will differ based on context.
   * @param {string} org     The desired namespace of the plugin.
   * @param {string} version Version of the plugin to install (optional).
   * @param {string} scripts Location of the scripts directory on your local computer.
   */
  constructor(plugin, root, org = null, version = 'latest', scripts = '../scripts') {
    // Probably a bunch of stuff to bootstrap config.

    this.pluginName = plugin;
    this.namespace = org;
    this.version = version;
    this.scripts = scripts;
    // @todo: must pass in the best default for user's release channel for `version` variable.
    // Set needsUpdate accordingly.
    this.needsUpdate = false;

    // Load the package.json (if available).
    // @todo: see if package.json exists, set isInstalled on that basis/load package.json.
    this.path = `${root}/${plugin}`;
    this.isInstalled = fs.existsSync(`${this.path}/package.json`);
    this.pjson = this.isInstalled ? this.load() : {};

    // Does this seem like a legit Lando plugin? Use this.load() output.
    this.valid = true;
  }

  /**
   * Install a plugin.
   */
  async add() {
    const {execa} = await import('execa'); // eslint-disable-line node/no-unsupported-features/es-syntax
    // @todo: move the removing of the old plugin to after the plugin install; possibly run inside the Docker script.
    if (fs.existsSync(this.path)) {
      fs.rmSync(this.path, {recursive: true});
    }

    mkdirp.sync(this.path);
    const run = execa('docker', ['run', '--rm', '-v', `${this.path}:/plugins/${this.pluginName}`, '-v', `${this.scripts}:/scripts`, '-w', '/tmp', 'node:14-alpine', 'sh', '-c', `/scripts/add.sh ${this.pluginName}`]);
    run.stdout.on('data', buffer => {
      const debug = require('debug')(`add-${this.pluginName}:@lando/hyperdrive`);
      debug(String(buffer));
    });
    return run;
  }

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
  async info() {
    const npmFetch = require('npm-registry-fetch');
    const opts = {
      // Integrate config file npm section that allows you to define npmrc options to pass in to here/other npm-related commands.
      // npm-registry-fetch commands: https://www.npmjs.com/package/npm-registry-fetch
      // npm config: https://docs.npmjs.com/cli/v8/using-npm/config
      /*       registry: '',
      agent: this.config['user-agent'],
      gzip: 'does not exist',
      headers: 'does not exist',
      ignoreBody: 'does not exist',
      integrity: 'does not exist',
      mapJSON: 'does not exist',
      maxSockets: this.config['maxsockets'],
      method: 'does not exist',
      npmSession: 'does not exist',
      npmCommand: 'does not exist',
      otpPrompt: 'does not exist; maybe want a default function here?',
      // Basic auth password...I'm not sure if this is supported in modern npm config
      password: this.config['_auth'],
      query: 'does not exist',
      retry: 'does not exist; this is just an object-value alternative to pass in values provided a single properties by config...not needed',
      spec: 'does not exist',
      timeout: this.config['fetch-timeout'],
      // I think this is the correct mapping
      _authToken: this.config['_auth'],
      username: 'does not exist; believe basic auth is not supported in modern npm config',
      */
      // This is the format required for authing with an authtoken...maybe put this in a demo config file.
      '//<npm.pkg.github.com>/:_authToken': 'THE AUTH TOKEN',
    };
    return npmFetch.json(this.pluginName, opts);
  }

  /**
   * Retrieve the package.json and Lando plugin config for the plugin (if it exists on the filesystem).
   *
   */
  load() {
    // Should return a combined package/config json object.
  }
}

module.exports = Plugin;
