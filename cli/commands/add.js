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

    // @TODO: modimodify the config file as needed?
    // @TODO: no argv maybe suggest hyperdrive install?
    // @TODO: what about team context?
    // @TODO: what happens if we pull down a plugin that is not a lando plugin?
    // @TODO: move to listr?
    // @TODO: run multiple args in parallel remove map function

    // intall the plugins based on context
    // modify the landofile as needed?

    // Start the spinner
    CliUx.ux.action.start('Installing...');
    await (app && !flags.global ? app.installPlugin(argv[0]) : hyperdrive.installPlugin(argv[0]));
  }
}

module.exports = AddCommand;
