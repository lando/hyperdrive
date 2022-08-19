const {Flags} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');

class ConfigCommandGet extends BaseCommand {
  static description = 'gets configuration';
  static usage = 'config get [<KEY> [<KEY> ...]] [-c <value>] [--config <value>] [--store <value>] [--protected] [--debug] [--help] [--json]';
  static examples = [
    'hyperdrive config get',
    'hyperdrive config get core.telemetry --json',
    'hyperdrive config get core.telemetry updates.notify --store=user',
    'hyperdrive config get -c config.yaml',
    'hyperdrive config get --store user',
  ];

  static strict = false;

  static args = [{
    name: 'key',
    description: 'config key(s) to get',
    required: false,
  }];

  static flags = {
    ...BaseCommand.globalFlags,
    protected: Flags.boolean({
      default: false,
      description: 'shows protected system config',
    }),
    store: Flags.string({
      description: 'gets a specific config store',
      options: ['app', 'global', 'system', 'user'],
    }),
  };

  async run() {
    const chalk = require('chalk');
    const get = require('lodash/get');
    const prettify = require('./../../../utils/prettify');
    const sortBy = require('lodash/sortBy');

    const {CliUx} = require('@oclif/core');

    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandGet);
    // get the data, if argv has one element then use the string version
    const paths = argv.length === 1 ? argv[0] : argv;
    // get the hyperdrive and app objects
    const {hyperdrive, app} = this.config;

    // throw error if we are requesting the app store in the wrong context
    if (!app && flags.store === 'app') {
      this.error('app store not available in global context.', {
        suggestions: ['Go into an app directory and rerun the command'],
        ref: 'https://docs.lando.dev/hyperdrive/context',
        exit: 1,
      });
    }

    // get the data from the correct thing
    const config = app ? app.config : hyperdrive.config;
    const data = config.get(paths, flags.store, false);

    // filter out protected config by default
    if (!flags.protected) delete data.system;

    // if data is undefined then throw an error
    if (argv.length > 0 && (data === undefined || Object.keys(data).length === 0)) {
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
      const rows = hyperdrive.Config.keys(data, {expandArrays: false})
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
