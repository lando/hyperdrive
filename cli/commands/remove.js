const {Flags} = require('@oclif/core');
const { PluginCommand } = require('../lib/plugin-command');

class RemoveCommand extends PluginCommand {
  static description = `Remove a plugin or dependency from your Lando installation.`;

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
    const utils = require('../lib/utils');
    const {flags, argv} = await this.parse(RemoveCommand);
    const {CliUx} = require('@oclif/core');
    const home = this.config.home;

    // Start the spinner
    CliUx.ux.action.start('Uninstalling...');

    try {
      console.log(argv);
      await utils.map(argv, function(plugin) { // eslint-disable-line unicorn/no-array-method-this-argument
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
