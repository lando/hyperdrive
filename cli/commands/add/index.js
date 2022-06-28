const {PluginCommand} = require('../../lib/plugin-command');
const {CliUx} = require('@oclif/core');
const path = require('path');

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
    'hyperdrive add @lando/apache@0.5.0'
  ];

  async run() {
    const {execa} = await import('execa');
    const utils = require('../../lib/utils');

    // Lando should install Docker Desktop by default, but have a flag --no-docker-desktop that would skip installing it.
    // OCLIF "Topics" to create a subcommand `hyperdrive add lando`/`hyperdrive add docker-desktop`, which may be useful for creating these distinct variations for Lando/Docker Desktop
    const {flags, args} = await this.parse(AddCommand);

    // Start the spinner
    CliUx.ux.action.start('Installing...');

    // Move the scripts folder into the OCLIF data directory.
    const scripts = path.join(this.config.dataDir, 'scripts');
    const home = this.config.home;
    utils.moveConfig(path.resolve(__dirname, '..', '..', '..', 'scripts'), scripts);

    // Split out plugin namespace.
    const namespace = args.plugin.split('/')[0];

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
      // @todo: accept multiple plugin arguments. Run in parallel with a Promise.all or something that runs multiple execa commands?
      const {stdout} = await execa('docker', ['run', '--rm', '-v', `${home}/.lando/plugins:/plugins`, '-v', `${scripts}:/scripts`, '-w', '/tmp', 'node:14-alpine', 'sh', '-c', `/scripts/add.sh ${args.plugin} ${namespace}`]);
      CliUx.ux.action.stop();
      this.log(stdout);
      // Some sort of nice error message? What can we cull?
      // Log stdout to a file...does OCLIF have something helpful there? Just have --debug flag print stdout...the OCLIF debug module should help here.
      // Can execa stream that information so you can see it in realtime?
    }
  }
}

module.exports = AddCommand;
