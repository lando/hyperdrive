const chalk = require('chalk');
const keys = require('all-object-keys');

const {CliUx, Flags} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');

class ConfigCommandGet extends BaseCommand {
  static description = 'gets hyperdrive configuration';
  static usage = 'config get [<KEY> [<KEY> ...]] [-c <value>] [--debug] [--help] [--json]';
  static examples = [
    'hyperdrive config get',
    'hyperdrive config get core.telemetry --json',
    'hyperdrive config get core.telemetry updates.notify --store=user',
    'hyperdrive config get -c config.yaml',
    'hyperdrive config get --store user',
  ]

  static strict = false;

  static args = [{
    name: 'key',
    description: 'config key(s) to get',
    required: false,
  }];

  static flags = {
    ...BaseCommand.globalFlags,
    store: Flags.string({
      description: 'gets a specific config store',
      options: ['system', 'user'],
    }),
  };

  async run() {
    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandGet);
    // get the hyperdrive config object
    const config = this.config.hyperdrive;

    // get the data, if argv has one element then use the string version
    const paths = argv.length === 1 ? argv[0] : argv;
    const data = config.get(paths, flags.store, false);

    // if data is undefined then throw an error
    if (argv.length > 0 && (data === undefined || data === {})) {
      this.error('No configuration found for the given keys!', {
        suggestions: [`Run ${chalk.magenta('hyperdrive config get')} for a full list of keys`],
        ref: 'https://docs.lando.dev/hyperdrive/cli/config.html#get',
        exit: 1,
      });
    }

    // if the user wants json then just return the data
    if (flags.json) return data;

    // if the data is not an object then just print the result
    if (typeof data !== 'object' || data === null) {
      this.log(data);

    // otherwise CLI table
    } else {
      const rows = keys(data).map(key => ({key, value: config.get(key, flags.store, false)}));
      this.log();
      CliUx.ux.table(rows, {key: {}, value: {}});
      this.log();
    }
  }
}

module.exports = ConfigCommandGet;
