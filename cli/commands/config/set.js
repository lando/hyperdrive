const {BaseCommand} = require('../../lib/base-command');

class ConfigCommandSet extends BaseCommand {
  static description = 'sets hyperdrive configuration';
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
  };

  async run() {
    const set = require('lodash/set');
    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandSet);
    // get the hyperdrive config object
    const config = this.config.hyperdrive;

    // start with data from file or empty
    const data = config.stores.overrides ? config.stores.overrides.get() : {};
    // mix in argv if they have paths and values
    for (const arg of argv) {
      const path = arg.split('=')[0];
      const value = arg.split('=')[1];
      if (arg.split('=').length === 2) set(data, path, value);
    }

    // save result
    config.save(data);

    // if json then return the saved result
    if (flags.json) return data;
  }
}

module.exports = ConfigCommandSet;
