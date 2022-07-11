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
  // static

  async run() {
    const fs = require('fs');
    const map = require('../../utils/map');
    const {argv} = await this.parse(RemoveCommand);
    const {CliUx} = require('@oclif/core');
    const home = this.config.home;

    // Start the spinner
    CliUx.ux.action.start('Uninstalling...');

    try {
      console.log(argv);
      await map(argv, function(plugin) {
        const pluginFolder = '/' + plugin;
        const pluginFolderPath = `${home}/.lando/plugins${pluginFolder}`;
        fs.rmSync(pluginFolderPath, {recursive: true});
      });
      CliUx.ux.action.stop('Uninstall successful.');
    } catch (error) {
      CliUx.ux.action.stop('Uninstall failed.');
      this.error(error);
    }
  }
}

module.exports = RemoveCommand;
