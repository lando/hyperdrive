const fs = require('fs');
const path = require('path');

const {BaseCommand} = require('../../lib/base-command');

class ConfigCommandSet extends BaseCommand {
  static description = 'sets hyperdrive configuration';

  static args = [{
    name: 'key',
    description: 'config key(s) and their value(s) to set',
    required: false,
  }];

  static examples = [
    'hyperdrive config set core.telemetry=false',
    'hyperdrive config set core.telemetry=false updates.notify=false',
    'hyperdrive config set -c test.yaml',
  ];

  static flags = {
    ...BaseCommand.globalFlags,
  };

  static strict = false;

  static usage = 'config set [<KEY=VALUE> [<KEY=VALUE> ...]] [-c <value>] [--debug] [--help] [--json]';

  async run() {
    // load slower modules
    const _ = require('lodash');
    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandSet);
    // get the hyperdrive config object
    const config = this.config.hyperdrive;

    // throw warning (or is error better?) if config file does not exist
    // @NOTE: do we even get here or does it fail in bootstrap?
    if (flags.config && !fs.existsSync(path.resolve(flags.config))) {
      this.warn(`could not locate config file at ${flags.config}`);
    }

    // start with data from file or empty
    const data = config.stores.overrides ? config.stores.overrides.get() : {};
    // mix in argv if they have paths and values
    for (const arg of argv) {
      const path = arg.split('=')[0];
      const value = arg.split('=')[1];
      if (arg.split('=').length === 2) _.set(data, path, value);
    }

    // save result
    config.save(data);

    // if json then return the saved result
    if (flags.json) return data;
  }
}

module.exports = ConfigCommandSet;
