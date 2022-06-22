const {Command, Flags} = require('@oclif/core');

class BaseCommand extends Command {
  static enableJsonFlag = true;
  static globalFlags = {
    config: Flags.string({
      char: 'c',
      description: 'Uses configuration from specified file',
      env: 'HYPERDRIVE_CONFIG_FILE',
      default: undefined,
      helpGroup: 'GLOBAL',
    }),
    debug: Flags.boolean({
      default: false,
      description: 'Prints debugging information',
      helpGroup: 'GLOBAL',
    }),
    help: Flags.boolean({
      default: false,
      description: 'Prints help information',
      helpGroup: 'GLOBAL',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Prints output in JSON',
      helpGroup: 'GLOBAL',
    }),
  };

  async init() {
    // console.log('INIT')
  }
}

module.exports = {BaseCommand};
