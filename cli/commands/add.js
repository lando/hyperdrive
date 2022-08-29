const {PluginCommand} = require('../lib/plugin-command');

class AddCommand extends PluginCommand {
  static description = 'installs a plugin';
  static examples = [
    'hyperdrive add @lando/apache@0.5.0',
    'hyperdrive add @lando/apache@edge',
    'hyperdrive add @lando/apache --global',
  ];

  static args = [...PluginCommand.args];
  static flags = {...PluginCommand.flags};

  static strict = false;

  async run() {
    const {CliUx} = require('@oclif/core');
    // mods
    // args and flags
    const {argv, flags} = await this.parse(AddCommand);
    // get hyperdrive and app objects
    const {hyperdrive, app} = this.config;

    // weg
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
    await (app && !flags.global ? app.installPlugin(argv[0]) : hyperdrive.installPlugin(argv[0]));

    // Global install logic.
    // Run docker commands to install plugins.
    // try {
    //   await map(argv, plugin => {
    //     return installPlugin(plugin);
    //   });
    //   CliUx.ux.action.stop('Install successful.');
    // } catch (error) {
    //   // @TODO: Some sort of nice error message? What can we cull?
    //   CliUx.ux.action.stop('Install failed.');
    //   this.error(error);
    // }
  }
}

module.exports = AddCommand;
