// const debug = require('debug')('static@lando/core:docker-desktop');
const fs = require('fs');
const path = require('path');

const getClass = Parent => {
  class DockerNpm extends Parent {
    static name = 'docker-npm';
    static cspace = 'docker-npm';
    static config = {};
    static supportedPlatforms = ['darwin', 'linux', 'win32', 'wsl'];

    constructor(
      // id = LandoCLI.config.id,
      // product = LandoCLI.config.product,
    ) {
      // pass options upstream
      super();

      /*
      -#!/bin/sh
      -npm init -y
      -npm add $1 --no-progress --production --flat --no-default-rc --no-lockfile --link-duplicates
      -npm install --no-progress --production -C /tmp/node_modules/$2
      -cp -rf /tmp/node_modules/$2/* /plugins/$2
      */
      // @TODO: create lando mounter dir?
      // @TODO: move scripts into that dir
      // @TODO redo moveconfig, option to make executable
      // @TODO single file

      // @TODO: release-channel
      // @TODO: redo npmrc stuff? need to pass into

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
    }

    /**
     * Add a Lando plugin.
     * @NOTE: this is a hidden async function, we do it this way so the following happens
     * const result = await engine.addPlugin() -> blocks and returns a result object
     * const runner = engine.addPlugin() -> returns event emitter for custom stuff
     */
    addPlugin(plugin) {
      // @TODO: env parsing
      // @TODO: label parsing?
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
