// const debug = require('debug')('static@lando/core:docker-desktop');
const fs = require('fs');
const moveConfig = require('../utils/move-config');
const path = require('path');

const getClass = Parent => {
  // @TODO: error handling

  class DockerNpm extends Parent {
    static name = 'docker-npm';
    static cspace = 'docker-npm';
    static config = {};

    constructor(
      // id = LandoCLI.config.id,
      // product = LandoCLI.config.product,
    ) {
      // pass options upstream
      super();
      // @TODO: strip DOCKER ENV? and reset?

      // set the rest of our stuff
      // @TODO: what are our fallbacks here?
      const dataDir = DockerNpm.config.dataDir;
      this.scriptsSrc = DockerNpm.config.scripts;
      this.scriptsDest = path.join(dataDir, DockerNpm.name, 'scripts');
      if (DockerNpm.config.npmrc) {
        this.npmrcDest = path.join(dataDir, DockerNpm.name, '.npmrc');
        fs.writeFileSync(this.npmrcDest, DockerNpm.config.npmrc);
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
    addPlugin(plugin) {
      const cmd = ['sh', '-c', `/scripts/plugin-add.sh ${plugin.name}@${plugin.version} ${plugin.name}`];
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
  }

  return DockerNpm;
};

module.exports = {extends: 'core.engine', getClass};
