const chalk = require('chalk');
const debug = require('debug')('static@lando/core:lando-cli');
const parseStdoutJson = require('../utils/parse-stdout-json');
const fs = require('fs');
const get = require('lodash/get');
const path = require('path');
const which = require('which');

const {satisfies} = require('semver');

/**
 *
 */
class LandoCLI {
  static name = 'lando-cli';
  static cspace = 'lando-cli';
  static config = {};

  static info(cmd = 'lando --hyperdrive') {
    try {
      debug('missing needed lando config, getting it from %o', cmd);
      return parseStdoutJson(cmd);
    } catch {
      // @TODO need name?
      debug('could not parse output from "%o" correctly', cmd);
      return false;
    }
  }

  /**
   * @TODO: do we need any private properties?
   */
  constructor({
    version,
    bin = LandoCLI.config.bin,
    debugspace = LandoCLI.config.debugspace,
    id = LandoCLI.config.id,
    product = LandoCLI.config.product,
    autoSync = LandoCLI.config.autoSync,
    install = LandoCLI.config.install,
    name = LandoCLI.config.name,
    required = LandoCLI.config.required,
    releaseChannel = LandoCLI.config.releaseChannel,
  } = {}) {
    // set top level props
    this.autoSync = autoSync;
    this.bin = path.isAbsolute(bin) ? bin : which.sync('lando', {nothrow: true});
    this.name = name || path.basename(this.bin) || 'lando';
    this.channel = releaseChannel;
    this.id = id || product || path.basename(process.argv[1]) || 'hyperdrive';
    this.install = install;
    this.required = required;
    this.version = version;

    // computed props
    this.isInstalled = fs.existsSync(this.bin);
    this.configCommand = `${this.bin} --${this.id}`;
    this.debug = require('debug')(`${debugspace}:@lando/core:lando-cli`);

    // attempt to refresh info if we can
    // NOTE: this will not work if the actual version is less than the required 3.6.5
    if (this.isInstalled && (!this.version || this.autoSync)) {
      this.config = this.info() || undefined;
      this.version = get(this.config, `${this.bin}.lando.version`);
    }

    // props to determine status
    this.isHyperdrived = this.isInstalled && satisfies(this.version, '>=3.6.5');
    this.isSupported = this.isInstalled && satisfies(this.version, this.required);
    this.isReady = this.isHyperdrived && this.isSupported;

    // additional props
    this.updateAvailable = undefined;
    // log
    const status = this.isSupported ? chalk.green('supported') : chalk.red('not supported');
    this.debug('instantiated lando-cli version %o (%s), using %o', this.version, status, this.bin);
  }

  info() {
    try {
      debug('missing needed %o config, getting it from %o', this.name, this.configCommand);
      return parseStdoutJson(this.configCommand);
    } catch {
      // @TODO need name?
      debug('could not parse output from "%o" correctly', this.configCommand);
      return false;
    }
  }

  notInstalledError() {
    return {
      suggestions: [
        `Run ${chalk.magenta('hyperdrive install lando')} and let us install lando for you.`,
        'Move a version of lando that you have into $PATH to help us detect it',
        `Tell us where your lando is with ${chalk.magenta('hyperdrive config set lando-cli.bin=/path/to/my/lando')}`,
      ],
      ref: 'https://docs.lando.dev/getting-started/installation.html',
      exit: 1,
    };
  }

  notSupportedError() {
    return {
      suggestions: [
        `Run ${chalk.magenta('hyperdrive update lando')} and let us update lando for you.`,
        'Manually install the latest version of lando.',
      ],
      ref: 'https://docs.lando.dev/getting-started/updating.html',
      exit: 2,
    };
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
}

module.exports = LandoCLI;
