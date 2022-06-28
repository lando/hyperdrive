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

  static aliases = ['install'];

  static examples = [
    'hyperdrive add apache --global',
    'hyperdrive add apache@0.5.0'
  ];

  async run() {
    const {execa} = await import('execa');
    const utils = require('../../lib/utils');
    // Check the args; if it's a "protected" dependency like Lando or Docker Desktop, then
    // run the custom installation for those.

    // Lando should install Docker Desktop by default, but have a flag --no-docker-desktop that would skip installing it.
    // OCLIF "Topics" to create a subcommand `hyperdrive add lando`/`hyperdrive add docker-desktop`, which may be useful for creating these distinct variations for Lando/Docker Desktop
    const {flags, args} = await this.parse(AddCommand);

    // @todo: should we parse the version here or in hyperdrive.js?
    if (flags.global) console.log('global install');
    // Start the spinner
    CliUx.ux.action.start('Installing...');
    // Move the scripts folder into the OCLIF data directory using fs copy-sync, do this on an OCLIF hook?
    const scripts = path.join(this.config.dataDir, 'scripts');
    const home = this.config.home;
    utils.moveConfig(path.resolve(__dirname, '..', '..', '..', 'scripts'), scripts);
    // 1. @todo: improve Lando plugin handling to account for non-@lando namespaces, plugins without namespaces (no namespace folder created). mkdirp
    // 2. @todo: accept multiple plugin arguments. Run in parallel with a Promise.all or something that runs multiple execa commands?
    const {stdout} = await execa('docker', ['run', '--rm', '-v', `${home}/.lando/plugins:/plugins`, '-v', `${scripts}:/scripts`, '-w', '/tmp', 'node:14-alpine', 'sh', '-c', `/scripts/add.sh ${args.plugin}`]);
    CliUx.ux.action.stop();
    //this.log(stdout);
    // Some sort of nice error message? What can we cull?
    // Log stdout to a file...does OCLIF have something helpful there? Just have --debug flag print stdout...the OCLIF debug module should help here.
    // Can execa stream that information so you can see it in realtime?
  }
}

module.exports = AddCommand;
