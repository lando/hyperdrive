const {PluginCommand} = require('../../lib/PluginCommand');
const {Flags} = require('@oclif/core');

class AddLandoCommand extends PluginCommand {

  static flags = {
    'no-docker-desktop': Flags.boolean({
      description: 'Don\'t install Docker Desktop as part of installing Lando.',
      default: false,
    }),
  };

  // Install  "protected" dependencies like Lando or Docker Desktop.
  async run() {
    const {Hyperdrive} = require('../../../lib/hyperdrive');
    console.log(Hyperdrive);
    const hyperdrive = new Hyperdrive();

    // Lando should install Docker Desktop by default, but have a flag --no-docker-desktop that would skip installing it.
    // OCLIF "Topics" to create a subcommand `hyperdrive add lando`/`hyperdrive add docker-desktop`, which may be useful for creating these distinct variations for Lando/Docker Desktop
    const {flags, args} = this.parse(AddLandoCommand);
    // @todo: should we parse the version here or in hyperdrive.js?
    hyperdrive.installLando(flags['no-docker-desktop']);
  }
}

module.exports = AddLandoCommand;
