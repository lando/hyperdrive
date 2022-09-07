const fs = require('fs');
const path = require('path');

const getClass = Parent => {
  class DockerPluginInstaller extends Parent {
    static name = 'docker-plugin-installer';
    static cspace = 'docker-plugin-installer';
    static config = {};
    static supportedPlatforms = ['darwin', 'linux', 'win32', 'wsl'];

    constructor({
      debugspace = DockerPluginInstaller.config.debugspace,
    } = {}) {
      super();
      this.debug = require('debug')(`${debugspace}:@lando/core:docker-plugin-installer`);
    }

    /**
     * Installs a plugins deps
     */
    async installPlugin(dest, {
      command = DockerPluginInstaller.config.command,
      image = DockerPluginInstaller.config.image,
    } = {}) {
      // define our named volumes
      const npmCache = `${DockerPluginInstaller.config.id}_docker_plugin_installer_npm_cache`;
      const yarnCache = `${DockerPluginInstaller.config.id}_docker_plugin_installer_yarn_cache`;

      // if no command and yarn.lock then use yarn
      if (!command && fs.existsSync(path.join(dest, 'yarn.lock'))) {
        command = 'yarn install --json --production --cache-folder=/cache/yarn --emoji=false --no-progress';
      // if no command and package-locak.json then use npm ci
      } else if (!command && fs.existsSync(path.join(dest, 'package-lock.json'))) {
        command = 'npm ci --omit=dev --no-audit --no-progress';
      // otherwise npm install
      } else {
        command = 'npm install --omit=dev --no-audit --no-progress';
      }

      // Get a set of current volume names
      const currentVolumes = await this.listVolumes();
      const currentVolumeNames = new Set(currentVolumes.Volumes.map(volume => volume.Name));

      // create named volumes as needed
      for await (const cache of [npmCache, yarnCache]) {
        if (!currentVolumeNames.has(cache)) {
          await this.createVolume({Name: cache, Labels: {'dev.lando.volume': 'true'}});
          this.debug('created named volume %o', cache);
        }
      }

      // @TODO handle npmrc and yarnrc?

      // run the command
      return this.pullNRun(image, command, {createOptions: {
        WorkingDir: '/plugin',
        HostConfig: {
          Binds: [
            `${dest}:/plugin`,
            `${npmCache}:/root/.npm`,
            `${yarnCache}:/cache/yarn`,
            // `${this.npmrcDest}:/home/etc/npmrc`,
          ],
        },
        Tty: command.startsWith('npm'),
        Env: [
          'PREFIX=/home',
        ],
      }});
    }
  }

  return DockerPluginInstaller;
};

module.exports = {extends: 'core.engine', getClass};
