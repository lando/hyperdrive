/**
 * The class to instantiate a new Hyperdrive instance.
 *
 * @name hyperdrive
 * @return {Hyperdrive} An App instance
 */
 module.exports = class Hyperdrive {
  constructor() {
    // Probably a bunch of stuff to bootstrap config.
  };

  /**
   * Install a plugin.
   *
   * @param {string} plugin The plugin to install.
   * @param {string} version Version of the plugin to install (optional).
   * @param {string} context Global, dev, or a specified namespace.
   */
  addPlugin(plugin, version, context) {
  };

  /**
   * Install Docker Desktop.
   *
   * @param {string} version Version of Docker Desktop to install.
   */
  installDockerDesktop(version) {

  };

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
