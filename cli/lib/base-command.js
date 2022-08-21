const {Command, Flags} = require('@oclif/core');

class BaseCommand extends Command {
  static enableJsonFlag = true;
  static strict = false;
  static globalFlags = {
    config: Flags.string({
      char: 'c',
      description: 'use configuration from specified file',
      env: 'HYPERDRIVE_CONFIG_FILE',
      default: undefined,
      helpGroup: 'GLOBAL',
    }),
    debug: Flags.boolean({
      default: false,
      description: 'print debugging information',
      helpGroup: 'GLOBAL',
    }),
    help: Flags.boolean({
      default: false,
      description: 'print help information',
      helpGroup: 'GLOBAL',
    }),
    json: Flags.boolean({
      default: false,
      description: 'print output in JSON',
      helpGroup: 'GLOBAL',
    }),
  };
}

module.exports = {BaseCommand};
