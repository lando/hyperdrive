// const path = require('path');

// const {CliUx} = require('@oclif/core');
const {PluginCommand} = require('../lib/plugin-command');

class RemoveCommand extends PluginCommand {
  static description = 'Remove a plugin or dependency from your Lando installation.';

  static usage = 'lando remove @lando/apache';

  static aliases = ['uninstall'];

  static strict = false;

  // static args
  // static plugin
  // static examples
  // static parserOptions

  async run() {
    // mods
    // // get from config
    // const {bootstrap} = this.config;
    // // get needed classes
    // const Plugin = bootstrap.getClass('plugin');
    // // get argv
    // const {argv} = await this.parse(RemoveCommand);

    // @TODO: to remove we need a list of all plugins so we can search by argv and return the root/location
    // and then use that to remove

    //   const home = this.config.home;
    //   const pluginsFolder = `${home}/.lando/plugins`;
    //   const scripts = path.join(this.config.dataDir, 'scripts');

    //   // Start the spinner
    //   CliUx.ux.action.start('Uninstalling...');

    //   try {
    //     await map(argv, function(pluginName) {
    //       const plugin = new Plugin(pluginName, pluginsFolder, null, 'latest', scripts);
    //       return plugin.remove();
    //     });
    //     CliUx.ux.action.stop('Uninstall successful.');
    //   } catch (error) {
    //     CliUx.ux.action.stop('Uninstall failed.');
    //     this.error(error);
    //   }
  }
}

module.exports = RemoveCommand;
