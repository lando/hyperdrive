const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

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
    // load slower modules
    // @TODO: remove lodash in favor of mostly native
    const _ = require('lodash');
    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandGet);
    // get the hyperdrive config object
    const config = this.config.hyperdrive;

    // throw warning (or is error better?) if config file does not exist
    // @NOTE: do we even get here or does it fail in bootstrap?
    if (flags.config && !fs.existsSync(path.resolve(flags.config))) {
      this.warn(`could not locate config file at ${flags.config}`);
    }

    // start with the total data set
    const data = flags.store ? config.stores[flags.store].get() : config.get();

    // if the user wants json then just return the data
    if (flags.json) return _.isEmpty(argv) ? data : _.pick(data, argv);

    // otherwise print a CLI table
    const keys = _.isEmpty(argv) ? config.getPaths(flags.store) : argv;
    const rows = _(config.getPaths(flags.store))
    .filter(path => _.includes(keys, path))
    .map(path => ({key: path, value: _.get(data, path)}))
    .sortBy('key', 'DESC')
    .value();

    // if we end up with nothing lets error
    // @TODO: improve this error eg there are a few different things that can happen
    // @TODO: lets also try to use some of the "advanced" error options eg suggestion/ref
    if (_.isEmpty(rows)) {
      this.error(`could not locate properties: ${chalk.red(argv.join(' '))}`);
      this.exit(2);
    }

    this.log();
    // @TODO: add support for table flags
    CliUx.ux.table(rows, {key: {}, value: {}});
    this.log();
  }
}

module.exports = ConfigCommandGet;
