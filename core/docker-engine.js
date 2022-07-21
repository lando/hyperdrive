const { flagUsage } = require('@oclif/core/lib/parser/help');
const Dockerode = require('dockerode');

class DockerEngine extends Dockerode {
  constructor(options = {}) {
    super(options);
    this.name = 'docker';
    this.supportedOS = ['linux'];
    //this.info = this.info();
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
      },*/
      WorkingDir: '/tmp',
      HostConfig: {
        AutoRemove: true,
        Binds: [
          `${plugin.path}:/plugins/${plugin.name}`,
          `${plugin.scripts}:/scripts`,
        ]
      },
      //tty: false,
    };

    try {
      // @todo: would be nice to pass in process.stderr to get that output...could try using demux helper
      // on debug statement to print that out at will.
      super.run('node:14-alpine', ['sh', '-c', `/scripts/add.sh ${plugin.name}@${plugin.version} ${plugin.name}`], null, createOptions, function (err, data, container) {
        //...
      }).on('stream', function (stream) {
        stream.on('data', buffer => {
          // @todo: way to clean the output up?
          const debug = require('debug')(`hyperdrive:engine:${plugin.name}`);
          debug(String(buffer));
        });
      });
    } catch (error) {
      console.log(error);
    }

    //super.run('node:14-alpine', ['sh', '-c', `/scripts/add.sh ${plugin.name}@${plugin.version} ${plugin.name}`], null, createOptions, function(data) {
  }

  /**
   * Self install.
   */
  async install() {

  }

  async up() {

  }

  async down() {

  }

  async isUp() {
    // @todo: docker info or ping, does it give a response?
  }

  /**
   * Version, what the VM is (for warnings on mismatches between our engine class and the engine you're
   * running, example: config says docker desktop, but you're actually using docker ce), resource allocation (to compare against actual resources).
   *
   */
  async info() {

  }


}

module.exports = DockerEngine;
