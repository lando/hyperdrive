const chalk = require('chalk');

const {BaseCommand} = require('../../lib/base-command');
const {Flags} = require('@oclif/core');

class ConfigCommandSet extends BaseCommand {
  static description = 'sets configuration';
  static usage = 'config set [<KEY=VALUE> [<KEY=VALUE> ...]] [-c <value>] [--debug] [--help] [--json]';
  static examples = [
    'hyperdrive config set core.telemetry=false',
    'hyperdrive config set core.telemetry=false updates.notify=false',
    'hyperdrive config set -c test.yaml',
  ];

  static strict = false;

  static args = [{
    name: 'key',
    description: 'config key(s) and their value(s) to set',
    required: false,
  }];

  static flags = {
    ...BaseCommand.globalFlags,
    force: Flags.boolean({
      default: false,
      description: 'forces setting of protected config',
      hidden: true,
    }),
  };

  async run() {
    const set = require('lodash/set');
    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandSet);
    // get the hyperdrive config object
    const {hyperdrive} = this.config;

    // start with data from file or empty
    const data = hyperdrive.config.stores.overrides ? hyperdrive.config.stores.overrides.get() : {};

    // mix in argv if they have paths and values
    for (const arg of argv) {
      const path = arg.split('=')[0];
      const value = arg.split('=')[1];

      // if this a protect property then error
      if ((path.startsWith('system.') && !flags.force)) {
        this.error(`${path} is a protected config setting, we dont recommend you modify it!`, {
          suggestions: [
            `Use the hidden --force flag to set the config regardless. ${chalk.magenta('THIS IS USUALLY A BAD IDEA!')}`,
          ],
          ref: 'https://docs.lando.dev/hyperdrive/',
          exit: 1,
        });
        continue;
      }

      // if we have a key and value then set it
      if (arg.split('=').length === 2) set(data, path, value);
    }

    // save result
    hyperdrive.config.save(data);

    // if json then return the saved result
    if (flags.json) return data;
  }
}

module.exports = ConfigCommandSet;
