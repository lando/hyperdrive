// const chalk = require('chalk');
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
    // @TODO: what about a way to return just the value?
    // @TODO: error if no result at all?
    // @TODO: warning if no prop?

    // get args and flags
    const {argv, flags} = await this.parse(ConfigCommandGet);
    // get the hyperdrive config object
    const config = this.config.hyperdrive;
    // get the data
    const data = config.get(argv, flags.store, false);

    // if the user wants json then just return the data
    if (flags.json) return data;

    // otherwise build rows for CLI table
    const rows = keys(data).map(key => ({key, value: config.get(key, flags.store, false)}));

    // // if we end up with nothing lets error
    // // @TODO: improve this error eg there are a few different things that can happen
    // // @TODO: lets also try to use some of the "advanced" error options eg suggestion/ref
    // if (rows.length === 0) {
    //   this.error(`could not locate properties: ${chalk.red(argv.join(' '))}`);
    //   this.exit(2);
    // }

    this.log();
    // @TODO: add support for table flags
    CliUx.ux.table(rows, {key: {}, value: {}});
    this.log();
  }
}

module.exports = ConfigCommandGet;
