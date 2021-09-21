const { Command } = require('@oclif/config');
const {flags} = require('@oclif/command');
const Config = require('@oclif/config');

class DynamicPlugin extends Config.Plugin {
  get hooks() { return {} }
  get topics() {
    return []
  }
  get commandIDs() {
    return ['mydynamiccommand']
  }

  get commands() {
    const cmd = require('./../more/bye');
    cmd.id = 'bye';
    cmd.load = () => cmd;
    return [cmd];
  }
}

/*
 * New plugin types:
 * HyperdrivePlugin extends Config.Plugin
 * 1. accepts a list of commands and an optional selector function for a "parent"
 *
 *
*/

module.exports = async (options) => {
  // commands = [require('./../more/bye')];
  // config.plugins.push(new DynamicPlugin(config))
  // console.log(config.plugins);
  // config.plugins[0].commands[0].flags.stuff = flags.string({char: 'z', description: 'name to print'});
  console.log(options); // {id, argv, conf}

  // Set DEBUG=* when -vvv is set?

  // Load in bootstrap config from configDir
  /*
    bootstrap:
      bootstrapper: ./lib/bootstrap.js
      envPrefix:
        - HYPERDRIVE_
      configSources:
        - config.yml
      mode: 'cli',
      packaged: _.has(process, 'pkg'),

      channel: stable?
      leia: _.has(process, 'env.LEIA_PARSER_RUNNING')
      pluginDirs: _.compact(pluginDirs.concat(process.landoAppPluginDirs))
      plugins: ,
      product: 'lando',
      userAgent: `Lando/${version}`,

      //
      channel: 'stable',
      landoFile: '.lando.yml',
      logLevelConsole: (this.argv().verbose) ? this.argv().verbose + 1 : this.logLevel,
      logDir: path.join(this.userConfRoot, 'logs'),
      mode: 'cli',
      packaged: _.has(process, 'pkg'),
      pluginDirs: _.compact(pluginDirs.concat(process.landoAppPluginDirs)),
      preLandoFiles: ['.lando.base.yml', '.lando.dist.yml', '.lando.upstream.yml'],
      postLandoFiles: ['.lando.local.yml'],
      userConfRoot: this.userConfRoot,
      version,

    */

    // run bootstrap
    // 1. merge in more config
    // 2. go through plugins and build manifest of components/config/whatever
    // 3. traverse plugins to find commands
    // 4. what do commandIDs do?
    // 5. install defaults eg desktop -> lando-desktop
    /*
      hyperdrive:
        // list of installers
        installers:

        // Just OCLIF command objects, this is just a list of metadata
        commands:
          - {id: 'install', variant: 'lando-docker-engine', path:  }

        plugins:
          - pathtofunction -> gets config and returns plugin

        // Final mods to commands, useful to add more options/args etc
        mods: (?)
          - {id: 'install', path: }

    */
}
