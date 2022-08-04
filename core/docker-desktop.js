const Docker = require('./docker-engine');
const fs = require('fs');
const path = require('path');

class DockerDesktop extends Docker {
  constructor(options = {}) {
    super(options);
    this.name = 'docker-desktop';
    this.supportedOS = ['linux', 'windows', 'macos'];
    this.getVersion = this.getVersion();
    this.isInstalled = this.getInstalled();
  }

  /**
   * Add async info to the engine.
   *
   * @param {*} options
   * @returns
   */
  async init(options) {
    const engine = new DockerDesktop(options);
    engine.info = await this.info();
    return engine;
  }

  /**
   * Self install.
   */
  async install() {}

  /**
   * Check for the existence of the app in expected location.
   */
  getInstalled() {
    const binPath = this.binPath();
    switch (process.platform) {
    case 'darwin': return fs.existsSync(binPath);
    case 'linux': return fs.existsSync(binPath);
    case 'win32': return fs.existsSync(binPath);
    }
  }

  binPath() {
    switch (process.platform) {
    case 'darwin':
      return '/Applications/Docker.app/Contents/Resources/bin';
    case 'linux':
      // @todo: get reliable Linux Docker Desktop path.
      return '/usr/share/lando/bin';
    case 'win32': {
      const programFiles = process.env.ProgramW6432 || process.env.ProgramFiles;
      const programData = process.env.ProgramData;
      // Check for Docker in 2.3.0.5+ first
      if (fs.existsSync(path.win32.join(programData + '\\DockerDesktop\\version-bin\\docker.exe'))) {
        return path.win32.join(programData + '\\DockerDesktop\\version-bin');
        // Otherwise use the legacy path
      }

      return path.win32.join(programFiles + '\\Docker\\Docker\\resources\\bin');
    }
    }
  }

  async up() {}

  async down() {}

  async isUp() {
    // @todo: docker info or ping, does it give a response?
  }

  /**
   * Version, what the VM is (for warnings on mismatches between our engine class and the engine you're
   * running, example: config says docker desktop, but you're actually using docker ce), resource allocation (to compare against actual resources).
   *
   */
  async info() {
    if (this.isUp()) {
      return super.info();
      // @todo: check to see if VM matches our expected this.name.

      // @todo: check resource allocation within limits.

      // @todo: storage check...need to figure out how to measure it.
    }
  }

  getVersion() {}
}

module.exports = DockerDesktop;
