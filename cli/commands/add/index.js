const {PluginCommand} = require('../lib/plugin-command');
const {flags} = require('@oclif/core');

class AddCommand extends PluginCommand {
  // @TODO: For individual apps, you can create a .npmrc file to specify private registry.
  // https://stackoverflow.com/questions/34652563/using-myproject-npmrc-with-registry
  // For global context, we should have a global config option for specifying a .npmrc file OR allow the user to put .npmrc in your Hyperdrive config. Need to figure out precedence.
  static description = 'Add a plugin or dependency to your current Lando context, specify a --global flag.';
  static usage = 'usage';

  static aliases = ['install'];

  static examples = [
    'hyperdrive add apache --global',
    'hyperdrive add apache@0.5.0'
  ];

  async run() {
    const {Hyperdrive} = require('../../../lib/hyperdrive');
    const hyperdrive = new Hyperdrive();
    // Check the args; if it's a "protected" dependency like Lando or Docker Desktop, then
    // run the custom installation for those.

    // Lando should install Docker Desktop by default, but have a flag --no-docker-desktop that would skip installing it.
    // OCLIF "Topics" to create a subcommand `hyperdrive add lando`/`hyperdrive add docker-desktop`, which may be useful for creating these distinct variations for Lando/Docker Desktop
    const {flags, args} = this.parse(AddCommand);
    // @todo: should we parse the version here or in hyperdrive.js?
    if (flags.global) hyperdrive.addPlugin(args.plugin);
  }
}

module.exports = AddCommand;
