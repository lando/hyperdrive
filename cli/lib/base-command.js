const {Command, Flags} = require('@oclif/core');

class BaseCommand extends Command {
  static enableJsonFlag = true;
  static strict = false;
  static globalFlags = {
    config: Flags.string({
      char: 'c',
      description: 'uses configuration from specified file',
      env: 'HYPERDRIVE_CONFIG_FILE',
      default: undefined,
      helpGroup: 'GLOBAL',
    }),
    debug: Flags.boolean({
      default: false,
      description: 'prints debugging information',
      helpGroup: 'GLOBAL',
    }),
    help: Flags.boolean({
      default: false,
      description: 'prints help information',
      helpGroup: 'GLOBAL',
    }),
    json: Flags.boolean({
      default: false,
      description: 'prints output in JSON',
      helpGroup: 'GLOBAL',
    }),
  };
}

module.exports = {BaseCommand};
