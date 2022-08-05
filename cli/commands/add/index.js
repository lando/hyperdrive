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

  static aliases = ['install'];

  static examples = [
    'hyperdrive add @lando/apache --global',
    'hyperdrive add @lando/apache@0.5.0',
  ];

  static strict = false;

  async run() {
    // mods
    const map = require('../../../utils/map');
    // get from config
    const {bootstrap} = this.config;
    // get needed classes
    const Plugin = bootstrap.getClass('plugin');

    // Lando should install Docker Desktop by default, but have a flag --no-docker-desktop that would skip installing it.
    // OCLIF "Topics" to create a subcommand `hyperdrive add lando`/`hyperdrive add docker-desktop`, which may be useful for creating these distinct variations for Lando/Docker Desktop
    const {flags, argv} = await this.parse(AddCommand);

    // Start the spinner
    CliUx.ux.action.start('Installing...');

    // Move the scripts folder into the OCLIF data directory.

    // @todo: context detection. If we're in a Lando app, we'll add the plugin
    // to that app. We'll need to create a @lando/bootstrap package that will
    // provide the functionality to...
    //  - analyze/load Lando global config
    //  - load a Lando app
    // ...in our case this will be used to detect context and load the Landofile.

    // App install logic.

    // Namespace install logic.

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
