const Dockerode = require('dockerode');

class DockerEngine extends Dockerode {
  constructor(options = {}) {
    super(options);
    this.name = 'docker';
    this.supportedOS = ['linux'];
    this.version = this.getVersion();
    this.isInstalled = this.getInstalled();
  }

  /**
   * Add async info to the engine.
   *
   * @param {*} options
   * @returns
   */
  async init(options) {
    const engine = new DockerEngine(options);
    engine.info = await this.info();
    return engine;
  }

  /**
   * Add a Lando plugin.
   */
  async addPlugin(plugin) {
    const createOptions = {
      /*
      Volumes: {
        [plugin.path]: `/plugins/${plugin.pluginName}`,
        [plugin.scripts]: '/scripts'
      }, */
      WorkingDir: '/tmp',
      HostConfig: {
        AutoRemove: true,
        Binds: [
          `${plugin.path}:/plugins/${plugin.name}`,
          `${plugin.scripts}:/scripts`,
        ],
      },
      // tty: false,
    };

    try {
      // @todo: would be nice to pass in process.stderr to get that output...could try using demux helper
      // on debug statement to print that out at will.
      super.run('node:14-alpine', ['sh', '-c', `/scripts/add.sh ${plugin.name}@${plugin.version} ${plugin.name}`], null, createOptions, function() {}).on('stream', function(stream) {
        stream.on('data', buffer => {
          // @todo: way to clean the output up better?
          if (buffer.toString() !== '\u001B[1G\u001B[0K') {
            const debug = require('debug')('engine:@lando/hyperdrive');
            debug(String(buffer));
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Self install.
   */
  async install() {}

  /**
   * Check for the existence of the app in expected location.
   */
  getInstalled() {}

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

module.exports = DockerEngine;
