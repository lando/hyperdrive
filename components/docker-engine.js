const fs = require('fs-extra');
const path = require('path');
const merge = require('lodash/merge');
const makeError = require('./../utils/make-error');
const makeSuccess = require('./../utils/make-success');
const mergePromise = require('./../utils/merge-promise');
const slugify = require('slugify');
const stringArgv = require('string-argv').default;

const Dockerode = require('dockerode');

const {EventEmitter} = require('events');
const {nanoid} = require('nanoid');
const {PassThrough} = require('stream');

class DockerEngine extends Dockerode {
  static name = 'docker-engine';
  static cspace = 'docker-engine';
  static config = {};
  // @NOTE: is wsl accurate here?
  static supportedPlatforms = ['linux', 'wsl'];

  constructor({
    debugspace = DockerEngine.config.debugspace,
  } = {}) {
    super();

    // @TODO: strip DOCKER ENV? and reset?

    this.debug = require('debug')(`${debugspace}:@lando/core:docker-engine`);
  }

  /**
   * This is intended for building images
   * This is a wrapper around Dockerode.build that provides either an await or return implementation.
   *
   * @param {*} command
   * @param {*} param1
   */
  build(dockerfile,
    {
      sources,
      tag,
      attach = false,
    } = {}) {
    // handles the promisification of the merged return
    const promiseHandler = async() => {
      return new Promise((resolve, reject) => {
        // if we are not attaching then lets log the progress to the debugger
        if (!attach) builder.on('progress', data => {
          // handle pully messages
          if (data.id && data.status) {
            if (data.progress) debug('%s %o', data.status, data.progress);
            else debug('%s', data.status);
          }

          // handle buildy messages
          if (data.stream) debug('%s', data.stream);
        });

        // handle resolve/reject
        builder.on('done', output => {
          resolve(makeSuccess(merge({}, args, {stdout: output[output.length - 1].status})));
        });
        builder.on('error', error => {
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
        if (err) builder.emit('error', err, output);
        // fire done no matter what?
        builder.emit('done', output);
        builder.emit('finished', output);
        builder.emit('success', output);
      };

      // progress event
      const progress = event => { // eslint-disable-line unicorn/consistent-function-scoping
        builder.emit('progress', event);
      };

      // eventify the stream
      this.modem.followProgress(stream, finished, progress);
    };

    // error if no dockerfile
    if (!dockerfile) throw new Error('you must pass a dockerfile into engine.build');
    // error if no dockerfile exits
    if (!fs.existsSync(dockerfile)) throw new Error(`${dockerfile} does not exist`);

    // collect some args we can merge into promise resolution
    // @TODO: obscure auth?
    const args = {command: 'dockerode buildImage', args: {dockerfile, tag, sources}};
    // create an event emitter we can pass into the promisifier
    const builder = new EventEmitter();
    // extend debugger in appropriate way
    const debug = tag ? this.debug.extend(`build:${tag}`) : this.debug.extend('build');
    // get a build directory dialed
    const context = path.join(require('os').tmpdir(), nanoid());
    fs.mkdirSync(context, {recursive: true});

    // create the build context
    for (const source of [dockerfile, sources].flat(Number.POSITIVE_INFINITY).filter(Boolean)) {
      fs.copySync(source, path.join(context, path.basename(source)));
      debug('copied %o into build context %o', source, context);
    }

    // call the parent
    super.buildImage({context, src: fs.readdirSync(context)}, {t: tag}, callbackHandler);
    // make this a hybrid async func and return
    return mergePromise(builder, promiseHandler);
  }

  /**
   * A helper method that automatically will pull the image needed for the run command
   * NOTE: this is only available as async/await so you cannot return directly and access events
   *
   * @param {*} command
   * @param {*} param1
   */
  async buildNRun(dockerfile, command, {sources, tag, createOptions = {}, attach = false} = {}) {
    // if we dont have a tag we need to set something
    if (!tag) tag = slugify(nanoid()).toLowerCase();
    // build the image
    await this.build(dockerfile, {attach, sources, tag});
    // run the command
    await this.run(command, {attach, createOptions, tag});
  }

  /**
   * Add async info to the engine.
   *
   * @param {*} options
   * @returns
   */
  async init() {
    // const engine = new DockerEngine(options);
    // engine.info = await super.info();
    // return engine;
  }

  /**
   * This is intended for pulling images
   * This is a wrapper around Dockerode.pull that provides either an await or return implementation eg:
   *
   * @param {*} command
   * @param {*} param1
   */
  pull(image,
    {
      auth,
      attach = false,
    } = {}) {
    // handles the promisification of the merged return
    const promiseHandler = async() => {
      return new Promise((resolve, reject) => {
        // if we are not attaching then lets log the progress to the debugger
        if (!attach) {
          puller.on('progress', progress => {
            // extend debugger in appropriate way
            const debug = progress.id ? this.debug.extend(`pull:${image}:${progress.id}`) : this.debug.extend(`pull:${image}`);
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

    // error if no command
    if (!image) throw new Error('you must pass an image (repo/image:tag) into engine.pull');

    // collect some args we can merge into promise resolution
    // @TODO: obscure auth?
    const args = {command: 'dockerode pull', args: {image, auth, attach}};
    // create an event emitter we can pass into the promisifier
    const puller = new EventEmitter();
    // call the parent with clever stuff
    super.pull(image, {authconfig: auth}, callbackHandler);
    // make this a hybrid async func and return
    return mergePromise(puller, promiseHandler);
  }

  /**
   * A helper method that automatically will pull the image needed for the run command
   * NOTE: this is only available as async/await so you cannot return directly and access events
   *
   * @param {*} command
   * @param {*} param1
   */
  async pullNRun(image, command, {auth, attach = false, createOptions = {}} = {}) {
    // pull the image
    await this.pull(image, {attach, authconfig: auth});
    // run the command
    await this.run(command, {attach, createOptions, image});
  }

  /**
   * This is intended for ephermeral none-interactive "one off" commands. Use `exec` if you want to run a command on a
   * pre-existing container.
   *
   * This is a wrapper around Dockerode.run that provides either an await or return implementation eg:
   *
   * @param {*} command
   * @param {*} param1
   */
  run(command,
    {
      image = 'node:16-alpine',
      createOptions = {},
      allo = '',
      attach = false,
      interactive = false,
      stream = null,
      stdouto = '',
      stderro = '',
    } = {}) {
    const promiseHandler = async error => {
      // handles the promisification of the merged return
      return new Promise((resolve, reject) => {
        // collect some args we can merge into promise resolution
        const args = {args: {command, image, copts, attach, stream}};

        // this handles errors that might happen before runner is set eg docker server errors
        if (error) reject(makeError(merge({}, args, {error, command: 'docker api'})));

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

    // error if no command
    if (!command) throw new Error('you must pass a command into engine.run');
    // arrayify commands that are strings
    if (typeof command === 'string') command = stringArgv(command);

    // some good default createOpts
    const defaultCreateOptions = {
      AttachStdin: interactive,
      HostConfig: {AutoRemove: true},
      Tty: false || interactive || attach,
      OpenStdin: true,
    };

    // merge our create options over the defaults
    const copts = merge({}, defaultCreateOptions, createOptions);
    // start by getting the event emiiter
    const runner = super.run(image, command, stream, copts, {}, promiseHandler);
    // make this a hybrid async func and return
    return mergePromise(runner, promiseHandler);
  }
}

module.exports = DockerEngine;
