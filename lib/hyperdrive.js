/**
 * The class to instantiate a new Hyperdrive instance.
 *
 * @name hyperdrive
 * @return {Hyperdrive} An App instance
 */
module.exports = class Hyperdrive {
  constructor() {
    // Probably a bunch of stuff to bootstrap config.
  }

  /**
   * Install Docker Desktop.
   *
   * @param {string} version Version of Docker Desktop to install.
   */
  installDockerDesktop(version) {}

  /**
   * Install Lando core components.
   *
   * @param {string} version Version of Lando to install.
   * @param {boolean} installDockerDesktop Whether to install Docker Desktop during Lando install.
   */
  installLando(version, installDockerDesktop = true) {
    if (installDockerDesktop) this.installDockerDesktop();
  }
};

/**
 *
 */
module.exports = class Plugin {
  /**
   *
   * @param {string} plugin  The plugin to install.
   * @param {string} root    Location of the plugin on my computer...will differ based on context.
   * @param {string} org     The plugin to install.
   * @param {string} version Version of the plugin to install (optional).
   */
  constructor(plugin, root, org = null, version = 'latest') {
    // Probably a bunch of stuff to bootstrap config.

    // @todo: must pass in the best default for user's release channel for `version` variable.
    // Set needsUpdate accordingly.
    this.needsUpdate = false;

    // Load the package.json (if available).
    // @todo: see if package.json exists, set isInstalled on that basis/load package.json.
    this.path = `${path}/${plugin}`;
    this.isInstalled = fs.exists(`${this.path}/package.json`);
    this.pjson = this.isInstalled ? this.load() : {};

    // Does this seem like a legit Lando plugin? Use this.load() output.
    this.valid = true;
  }

  /**
   * Install a plugin.
   */
  add() {}

  /**
   * Remove a plugin.
   *
   */
  remove() {}

  /**
   * Get metadata on a plugin.
   *
   */
  info() {}

  /**
   * Retrieve the package.json and Lando plugin config for the plugin (if it exists on the filesystem).
   *
   */
  load() {
    // Should return a combined package/config json object.
  }
};
