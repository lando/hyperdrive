const {BaseCommand} = require('../../lib/base-command');
const {Flags} = require('@oclif/core');

class PluginInfo extends BaseCommand {
  static description = 'shows plugin information';
  static usage = [
    'lando info @lando/apache',
    'lando info @lando/apache@stable',
    'lando info @lando/apache@^0.5.0',
  ];

  static args = [
    {
      name: 'plugin',
      required: true,
      description: 'the plugin(s)',
    },
  ];

  // @TODO: some sort of full flag?
  static flags = {
    ...BaseCommand.globalFlags,
  };

  async run() {
    const _ = require('lodash');
    const sortBy = require('lodash/sortBy');
    const prettify = require('../../../utils/prettify');
    const {CliUx} = require('@oclif/core');

    // get hyperdrive stuff
    const {hyperdrive} = this.config;
    const Plugin = hyperdrive.Plugin;

    const {args, flags} = await this.parse(PluginInfo);
    const data = await Plugin.info(args.plugin);
    if (flags.json) return data;

    // Format data for table display.
    const tableKeys = hyperdrive.Config.keys(data, {expandArrays: false});

    const rows = _(tableKeys)
    .filter(path => _.includes(tableKeys, path))
    .map(path => ({key: path, value: _.get(data, path)}))
    .value();

    this.log();
    CliUx.ux.table(sortBy(rows, 'key'), {
      key: {},
      value: {get: row => prettify(row.value)},
    });
    this.log();
  }
}

module.exports = PluginInfo;
