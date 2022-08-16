const {PluginCommand} = require('../../lib/plugin-command');
const {CliUx} = require('@oclif/core');

class AddCommand extends PluginCommand {
  // @TODO: For individual apps, you can create a .npmrc file to specify private registry.
  // https://stackoverflow.com/questions/34652563/using-myproject-npmrc-with-registry
  // For global context, we should have a global config option for specifying a .npmrc file OR allow the user to put .npmrc in your Hyperdrive config. Need to figure out precedence.
  static description = 'Add a plugin or dependency to your current Lando context.';
  static usage = 'usage';
  static args = [
    ...PluginCommand.args,
  ];

  static flags = {
    ...PluginCommand.flags,
  };

  static examples = [
    'hyperdrive add @lando/apache --global',
    'hyperdrive add @lando/apache@0.5.0',
  ];

  static strict = false;

  async run() {
    // mods
    const map = require('../../../utils/map');
    // get from config
    const {hyperdrive} = this.config;
    // get needed classes
    const Plugin = hyperdrive.getClass('plugin');

    // weg
    const {flags, argv} = await this.parse(AddCommand);

    // validate flags and args?
    // argv is now required?
    // @TODO: no argv maybe suggest hyperdrive install?
    // @TODO: what happens if we pull down a plugin that is not a lando plugin?
    // is there some way for us to validate this first? maybe something on Plugin.info()?

    // determine the context?
    // if --global then just assume hyperdrive.config
    // if not global then use app.config
    // if not global and no app then throw an error
    // @TODO: do we want helper methods like hyperdrive.plugin.add|remove|update or app.plugin.add|remove|update?

    // do engine various checks to ensure we can actually install a plugin
    // is the engine installed?
    // if not then prompt for installation? and add as first thing on listr or install separatly?
    // is the engine supported?
    // if not then prompt for installation? and add as first thing on listr or install separatly?
    // is the engine ready?
    // if not then prompt to turn it on? and add as first thing on listr or install separatly?

    // intall the plugins based on context
    // @TODO: what about team context?
    // modify the landofile as needed?
    // @TODO: move to listr?

    // Start the spinner
    CliUx.ux.action.start('Installing...');

    // Global install logic.
    if (flags.global) {
      // Run docker commands to install plugins.
      try {
        await map(argv, plugin => {
          return Plugin.add(plugin);
        });
        CliUx.ux.action.stop('Install successful.');
      } catch (error) {
        // @TODO: Some sort of nice error message? What can we cull?
        CliUx.ux.action.stop('Install failed.');
        this.error(error);
      }
    }
  }
}

module.exports = AddCommand;
