const {BaseCommand} = require('../lib/command');

class AddCommand extends BaseCommand {
  // @TODO: For individual apps, you can create a .npmrc file to specify private registry.
  // https://stackoverflow.com/questions/34652563/using-myproject-npmrc-with-registry
  // For global context, we should have a global config option for specifying a .npmrc file OR allow the user to put .npmrc in your Hyperdrive config. Need to figure out precedence.
  static description = 'Add a plugin or dependency to your current Lando context, specify a --global flag. Would be cool to have a --namespace option for custom "team" configuration.';

  static usage = 'usage';

  // Check the OCLIF 2 standard static aliases = ['install'];

  static examples = [];

  async run() {
    // Check the args; if it's a "protected" dependency like Lando or Docker Desktop, then
    // run the custom installation for those.

    // Lando should install Docker Desktop by default, but have a flag --no-docker-desktop that would skip installing it.
    // OCLIF "Topics" to create a subcommand `hyperdrive add lando`/`hyperdrive add docker-desktop`, which may be useful for creating these distinct variations for Lando/Docker Desktop
    const {flags} = this.parse(AddCommand);
    const name = flags.name || 'world';
    this.log(`goodbye ${name} from ./src/commands/hello.js`);
  }
}

module.exports = AddCommand;
