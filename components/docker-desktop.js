const fs = require('fs');
const moveConfig = require('./../utils/move-config');
const merge = require('lodash/merge');
const mergePromise = require('./../utils/merge-promise');
const path = require('path');

const Dockerode = require('dockerode');

class DockerDesktop extends Dockerode {
  static name = 'docker-desktop';
  static cspace = 'docker-desktop';

  constructor(options = {}) {
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
    super(options);
    // @TODO: strip DOCKER ENV? and reset?

    // set the rest of our stuff
    // @TODO: what are our fallbacks here?
    const dataDir = DockerDesktop.defaults.dataDir;
    this.scriptsSrc = DockerDesktop.defaults.scripts;
    this.scriptsDest = path.join(dataDir, DockerDesktop.name, 'scripts');
    if (DockerDesktop.defaults.npmrc) {
      this.npmrcDest = path.join(dataDir, DockerDesktop.name, '.npmrc');
      fs.writeFileSync(this.npmrcDest, DockerDesktop.defaults.npmrc);
    } else {
      this.npmrcDest = false;
    }

    moveConfig(this.scriptsSrc, this.scriptsDest);

    this.getVersion = this.getVersion();
    this.isInstalled = this.getInstalled();

    // @TODO: should these be static props?
    this.supportedOS = ['linux', 'windows', 'macos'];
  }

  /**
   * Add a Lando plugin.
   * @NOTE: this is a hidden async function, we do it this way so the following happens
   * const result = await engine.addPlugin() -> blocks and returns a result object
   * const runner = engine.addPlugin() -> returns event emitter for custom stuff
   */
  addPlugin(plugin, packageManager = 'npm') {
    const cmd = ['sh', '-c', `/scripts/plugin-add-${packageManager}.sh ${plugin.name}@${plugin.version} ${plugin.name}`];
    const createOptions = {
      WorkingDir: '/tmp',
      HostConfig: {
        Binds: [
          `${plugin.path}:/plugins/${plugin.name}`,
          `${this.scriptsDest}:/scripts`,
          `${this.npmrcDest}:/home/etc/npmrc`,
        ],
      },
      Env: [
        'PREFIX=/home',
      ],
    };
    return this.run(cmd, {createOptions});
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

  /**
   * This is intended for ephermeral none-interactive "one off" commands. Use `exec` if you want to run a command on a pre-existing container.
   * This is a wrapper around Dockerode.run that provides either an await or return implementation eg:
   *
   * // get an EventEmitter
   * const runner = engine.run(command);
   * runner.on('stream' stream);
   *
   * // block and await result
   * const result = await engine.run(command);
   * console.log(result);
   *
   * @param {*} command
   * @param {*} param1
   */
  run(
    command,
    {
      createOptions = {},
      interactive = false,
      image = 'node:14-alpine',
      pipe = null,
    } = {}) {
    // @TODO: automatic image pulling? implement pull wrapper using same mergePromise pattern?

    // some good default createOpts
    // @TODO: best way to provide stdin func? test on running vim or something?
    const defaultCreateOptions = {
      AttachStdin: interactive,
      HostConfig: {AutoRemove: true},
      Tty: false || interactive,
    };

    // figure out whether we should pipe the output somewhere
    const stream = pipe === true ? [process.stdout, process.stderr] : pipe;
    // merge our create options over the defaults
    const copts = merge({}, defaultCreateOptions, createOptions);

    const promiseHandler = async err => {
      return new Promise((resolve, reject) => {
        // this handles errors that might happen before runner is set
        // eg docker server errors
        // @TODO: better error object?
        // @NOTE: because this runs in the super.run callback its hard to catch it on the outside with await
        // is there something we can do about that? does it even matter?
        if (err) reject(err);

        // otherwise resolve or reject result based on status code
        // @TODO: do we want to try to collect stdout/stderr and add them to the result?
        // @TODO: is there other useful information on the stream/container/start events we can use?
        runner.on('data', result => {
          if (result.StatusCode === 0) resolve(result);
          else reject(result);
        });
      });
    };

    // start by getting the event emiiter
    const runner = super.run(image, command, stream, copts, {}, promiseHandler);

    // @TODO: handle streaming situation re debugging and output collection?

    // make this a hybrid async func and return
    return mergePromise(runner, promiseHandler);
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
