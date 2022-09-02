const fs = require('fs-extra');
const path = require('path');

const DockerEngine = require('./docker-engine');

class DockerDesktop extends DockerEngine {
  static name = 'docker-desktop';
  static cspace = 'docker-desktop';
  static supportedPlatforms = ['darwin', 'linux', 'win32', 'wsl'];

  constructor({
    debugspace = DockerDesktop.defaults.debugspace,
  } = {}) {
    console.log(DockerDesktop.defaults);
    // start by figuring out our dockerode options and passing them upstream

    // then set/strip needed ENVVARS

    // determine installed status
    // daemon/client locations
    // try to load in additional information from files as needed using core/Config?

    // determine is
    // @TODO: set upstream ops for dockerode eg host/socket?
    // console.log(DockerDesktop.defaults)
    // DockerDesktop.defaults
    /*
      // Set defaults if we have to
      if (_.isEmpty(engineConfig)) {
        engineConfig = {
          socketPath: (process.platform === 'win32') ? '//./pipe/docker_engine' : '/var/run/docker.sock',
          host: '127.0.0.1',
          port: 2376,
        };
      }
      // Set the docker host if its non-standard
      if (engineConfig.host !== '127.0.0.1') env.DOCKER_HOST = setDockerHost(engineConfig.host, engineConfig.port);
      // Set the TLS/cert things if needed
      if (_.has(engineConfig, 'certPath')) {
        env.DOCKER_CERT_PATH = engineConfig.certPath;
        env.DOCKER_TLS_VERIFY = 1;
        env.DOCKER_BUILDKIT = 1;
        engineConfig.ca = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'ca.pem'));
        engineConfig.cert = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'cert.pem'));
        engineConfig.key = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'key.pem'));
      }
      // Return
      return engineConfig;
    */

    // pass options upstream
    // @TODO: options?
    super();
    // @TODO: strip DOCKER ENV? and reset?
    this.debug = require('debug')(`${debugspace}:@lando/core:docker-desktop`);
    // this.getVersion = this.getVersion();
    // this.isInstalled = this.getInstalled();
  }

  async down() {}

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

  /**
   * Add async info to the engine.
   *
   * @param {*} options
   * @returns
   */
  async init() {
    // const stuff = await this.info();
    // console.log(stuff);
  }

  /**
   * Self install.
   */
  async install() {}

  async isUp() {
    // @todo: docker info or ping, does it give a response?
  }

  async up() {}

  getVersion() {}

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
}

DockerDesktop.defaults = {};
module.exports = DockerDesktop;
