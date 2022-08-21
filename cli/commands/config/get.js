const {CliUx, Flags} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');
const {extended} = CliUx.ux.table.flags();

class ConfigCommandGet extends BaseCommand {
  static description = 'gets configuration';
  static examples = [
    'hyperdrive config get',
    'hyperdrive config get core.telemetry --json',
    'hyperdrive config get -c config.yaml',
    'hyperdrive config get --protected',
  ];

  static args = [{
    name: 'key',
    description: 'config key(s) to get',
    required: false,
  }];

  static flags = {
    ...BaseCommand.globalFlags,
    extended,
    global: Flags.boolean({
      char: 'g',
      description: 'force use of global context',
      default: false,
    }),
    protected: Flags.boolean({
      default: false,
      description: 'show protected system config',
    }),
  };

  async run() {
    // mods and deps
    const chalk = require('chalk');
    const prettify = require('./../../../utils/prettify');
    const sortBy = require('lodash/sortBy');

    // args and flags
    const {argv, flags} = await this.parse(ConfigCommandGet);
    // get hyperdrive and app objects
    const {hyperdrive, app} = this.config;
    // get the starting data from the correct context
    const config = (app && !flags.global) ? app.config : hyperdrive.config;
    // start by just grabbing everything or a single value
    const data = (argv.length === 1) ? config.getUncoded(argv[0]) : config.getUncoded();

    // filter out protected config by default
    if (typeof data === 'object' && !flags.protected) delete data.system;

    // if data is undefined then throw an error
    if (argv.length > 0 && (data === undefined || Object.keys(data).length === 0)) {
      this.error(`No configuration found for key: "${argv[0]}"`, {
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
      this.exit();
    }

    // otherwise construct some rows for tabular display
    const rows = hyperdrive.Config.keys(data, {expandArrays: false}).map(key => {
      // if we have argv then we need to modify the key
      if (argv.length === 1) key = `${argv[0]}.${key}`;
      // start with the basics
      const row = {key, value: config.getUncoded(key)};
      // also loop through and add the values from each store for use in --extended
      for (const store of Object.keys(config.stores)) {
        row[store] = config.getUncoded(`${store}:${key}`);
      }

      return row;
    });

    // construct the column options
    const columns = {key: {}, value: {get: row => prettify(row.value)}};
    // also loop through and add the values from each store for use in --extended
    // @NOTE: this will not add stores with no content
    for (const [name, store] of Object.entries(config.stores)) {
      if (Object.keys(store.store).length > 0) {
        columns[name] = {get: row => prettify(row[name]), extended: true};
      }
    }

    // print table
    this.log();
    CliUx.ux.table(sortBy(rows, 'key'), columns, {extended: flags.extended});
    this.log();
  }
}

module.exports = ConfigCommandGet;
