const chalk = require('chalk');
const get = require('lodash/get');
const prettify = require('./../../../utils/prettify');

const {CliUx, Flags} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');

class ConfigCommandGet extends BaseCommand {
  static description = 'gets hyperdrive configuration';
  static usage = 'config get [<KEY> [<KEY> ...]] [-c <value>] [--config <value>] [--store <value>] [--system] [--debug] [--help] [--json]';
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
    system: Flags.boolean({
      default: false,
      description: 'shows protected system config',
    }),
    store: Flags.string({
      description: 'gets a specific config store',
      // @TODO: can we populate this automatically?
      options: ['managed', 'system', 'user'],
    }),
  };

  async run() {
    const sortBy = require('lodash/sortBy');
    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandGet);
    // get the hyperdrive config object
    const config = this.config.hyperdrive;
    const {keys} = this.config.Config;

    // get the data, if argv has one element then use the string version
    const paths = argv.length === 1 ? argv[0] : argv;
    const data = config.get(paths, flags.store, false);

    // filter out system config by default
    if (!flags.system && flags.store !== 'system') {
      delete data.system;
    }

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
      const rows = keys(data, {expandArrays: false})
      .map(key => ({key, value: config.get(key, flags.store, false) || get(data, key)}));

      this.log();
      CliUx.ux.table(sortBy(rows, 'key'), {
        key: {},
        value: {get: row => prettify(row.value)},
      });
      this.log();
    }
  }
}

module.exports = ConfigCommandGet;
