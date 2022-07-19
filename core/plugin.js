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

    const nameVersion = this.constructor.mungeVersion(plugin);
    this.pluginName = nameVersion.name;
    this.namespace = org;
    this.scripts = scripts;
    // @todo: must pass in the best default for user's release channel for `version` variable.
    // Set needsUpdate accordingly.
    this.needsUpdate = false;

    // Load the package.json (if available).
    this.path = `${root}/${plugin}`;
    const pjsonPath = `${this.path}/package.json`;
    this.isInstalled = fs.existsSync(pjsonPath);
    this.pjson = this.isInstalled ? this.load() : {};

    // Was version passed as part of the package name?
    if (nameVersion.version) {
      this.version = nameVersion.version;
    // Or should we use the installed version?
    } else if (this.isInstalled) {
      this.version = this.pjson.version;
    // of should we default to the release channel?
    } else {
      this.version = version;
    }

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
   *
   * Separate a provided plugin's name and version strings.
   *
   * @param {string} name A string containing the name and optional version info for a plugin.
   */
  static mungeVersion(name) {
    let nameVersion = {};
    nameVersion.version = name.slice(1).match('([^@]+$)')[0];
    nameVersion.name = name.replace(`@${nameVersion.version}`, '');
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
    const query = `${this.pluginName}@${this.version}`;
    const config = {
      fullMetadata: true,
      preferOnline: true,
    };
    const info = await manifest(query, config);
    return this.formatInfo(this.pluginName, info);
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

  /**
   * Retrieve the package.json and Lando plugin config for the plugin (if it exists on the filesystem).
   *
   */
  load() {
    // Should return a combined package/config json object.
    const pjsonPath = `${this.path}/package.json`;
    const pjson = require(pjsonPath);
    return pjson;
  }
}

module.exports = Plugin;
