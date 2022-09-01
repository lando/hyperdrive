// const debug = require('debug')('static@lando/core:docker-desktop');
const fs = require('fs');
const merge = require('lodash/merge');
const makeError = require('./../utils/make-error');
const makeSuccess = require('./../utils/make-success');
const mergePromise = require('./../utils/merge-promise');
const path = require('path');

const Dockerode = require('dockerode');
const {EventEmitter} = require('events');
const {PassThrough} = require('stream');

class DockerDesktop extends Dockerode {
  static name = 'docker-desktop';
  static cspace = 'docker-desktop';

  constructor({
    debugspace = DockerDesktop.defaults.debugspace,
  } = {}) {
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
    this.getVersion = this.getVersion();
    this.isInstalled = this.getInstalled();

    // @TODO: should these be static props?
    this.supportedOS = ['linux', 'windows', 'macos'];
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
   * This is intended for pulling images
   * This is a wrapper around Dockerode.pull that provides either an await or return implementation eg:
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
  pull(tag,
    {
      attach = false,
      auth,
    } = {}) {
    // collect some args we can merge into promise resolution
    // @TODO: obscure auth?
    const args = {command: 'dockerode pull', args: {tag, auth, attach}};
    // create an event emitter we can pass into the promisifier
    const puller = new EventEmitter();

    // handles the promisification of the merged return
    const promiseHandler = async() => {
      return new Promise((resolve, reject) => {
        // if we are not attaching then lets log the progress to the debugger
        if (!attach) {
          puller.on('progress', progress => {
            // extend debugger in appropriate way
            const debug = progress.id ? this.debug.extend(`pull:${tag}:${progress.id}`) : this.debug.extend(tag);
            // only debug progress if we can
            if (progress.progress) debug('%s %o', progress.status, progress.progress);
            // otherwise just debug status
            else debug('%s', progress.status);
          });
        }

        // handle resolve/reject
        puller.on('done', output => {
          resolve(makeSuccess(merge({}, args, {stdout: output[output.length - 1].status})));
        });
        puller.on('error', error => {
          reject(makeError(merge({}, args, {error})));
        });
      });
    };

    // handles the callback to super.pull
    const callbackHandler = async(error, stream) => {
      // this handles errors that might happen before pull begins eg docker server errors
      if (error) throw makeError(merge({}, args, {error, command: 'docker api'}));
      // if attach is on then lets stream output
      if (attach) stream.pipe(process.stdout);

      // finished event
      const finished = (err, output) => { // eslint-disable-line unicorn/consistent-function-scoping
        // if an error then fire error event
        if (err) puller.emit('error', err, output);
        // fire done no matter what?
        puller.emit('done', output);
        puller.emit('finished', output);
        puller.emit('success', output);
      };

      // progress event
      const progress = event => { // eslint-disable-line unicorn/consistent-function-scoping
        puller.emit('progress', event);
      };

      // eventify the stream
      this.modem.followProgress(stream, finished, progress);
    };

    // call the parent with clever stuff
    super.pull(tag, {authconfig: auth}, callbackHandler);
    // make this a hybrid async func and return
    return mergePromise(puller, promiseHandler);
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
  run(command,
    {
      createOptions = {},
      interactive = false,
      image = 'node:14-alpine',
      attach = false,
      stream = null,
      stdouto = '',
      stderro = '',
      allo = '',
    } = {}) {
    // @TODO: automatic image pulling? implement pull wrapper using same mergePromise pattern?

    // some good default createOpts
    // @TODO: best way to provide stdin func? test on running vim or something?
    const defaultCreateOptions = {
      AttachStdin: interactive,
      HostConfig: {AutoRemove: true},
      Tty: false || interactive,
    };

    // merge our create options over the defaults
    const copts = merge({}, defaultCreateOptions, createOptions);

    const promiseHandler = async error => {
      return new Promise((resolve, reject) => {
        // collect some args we can merge into promise resolution
        const args = {args: {command, image, copts, attach, stream}};

        // this handles errors that might happen before runner is set eg docker server errors
        if (error) {
          reject(makeError(merge({}, args, {error, command: 'docker api'})));
        }

        // if we get here we should have access to the container object so we should be able to collect output?
        runner.on('container', container => {
          runner.on('stream', stream => {
            // extend the debugger
            const debug = this.debug.extend(`run:${image}:${container.id.slice(0, 4)}`);

            // if we are attached and cannot demultiplex then stream to stdout
            if (attach && copts.Tty) stream.pipe(process.stdout);

            // collect "all" output eg stdout AND stderr
            stream.on('data', buffer => {
              // collect
              allo += String(buffer);

              // only log if we are not piping output
              // NOTE: does interactive make sense here?
              // NOTE: we also need if tty = true, otherwise we can demux and log stdout/stderr separately downstream
              if (!attach && copts.Tty) debug(String(buffer));
            });

            // if tty is false then we can separate out stdout and std err and collect and debug separately
            if (!copts.Tty) {
              // get some streams and extend the debugger
              const stdout = new PassThrough();
              const stderr = new PassThrough();
              stdout.debug = debug.extend('stdout');
              stderr.debug = debug.extend('stderr');

              // collect and debug if applicable
              stdout.on('data', buffer => {
                stdouto += String(buffer);
                if (!attach) stdout.debug(String(buffer));
              });
              stderr.on('data', buffer => {
                stderro += String(buffer);
                if (!attach) stderr.debug(String(buffer));
              });

              // make sure we close child streams when the parent is done
              stream.on('end', () => {
                try {
                  stdout.end();
                } catch {}

                try {
                  stderr.end();
                } catch {}
              });

              // dont cross the streams
              container.modem.demuxStream(stream, stdout, stderr);
              // pipe to process stds if attached
              if (attach) {
                stdout.pipe(process.stdout);
                stderr.pipe(process.stderr);
              }
            }
          });

          // otherwise resolve or reject result based on status code
          runner.on('data', data => {
            // get output
            const result = {command: 'dockerode run', all: allo, stdout: stdouto, stderr: stderro};
            // resolve or reject
            if (data.StatusCode === 0) {
              resolve(makeSuccess(merge({}, result, {args: command})));
            } else {
              reject(makeError(merge({}, args, result, {
                error: new Error(data.Error),
                exitCode: data.StatusCode || 1,
              })));
            }
          });
        });
      });
    };

    // start by getting the event emiiter
    const runner = super.run(image, command, stream, copts, {}, promiseHandler);
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
