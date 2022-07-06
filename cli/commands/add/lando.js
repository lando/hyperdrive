const {PluginCommand} = require('../lib/plugin-command');
const {Flags} = require('@oclif/core');
const utils = require('../lib/utils');

class AddLandoCommand extends PluginCommand {
  static id = 'add:lando';

  static flags = {
    'no-docker-desktop': Flags.boolean({
      description: 'Don\'t install Docker Desktop as part of installing Lando.',
      default: false,
    }),
  };

  static examples = [
    'hyperdrive install lando',
  ];

  static strict = false;
  // Install  "protected" dependencies like Lando or Docker Desktop.
  async run() {
    // Download the Lando binary.
    const landoPath = `${this.config.home}/.lando/lando`;
    utils.download('https://github.com/lando/lando/releases/download/v3.6.5/lando-arm64-v3.6.5.dmg', landoPath);

    // Lando should install Docker Desktop by default, but have a flag --no-docker-desktop that would skip installing it.
    // OCLIF "Topics" to create a subcommand `hyperdrive add lando`/`hyperdrive add docker-desktop`, which may be useful for creating these distinct variations for Lando/Docker Desktop
    // const {flags, args} = this.parse(AddLandoCommand);
    // @todo: should we parse the version here or in hyperdrive.js?
    // hyperdrive.installLando(flags['no-docker-desktop']);
  }
}

module.exports = AddLandoCommand;
