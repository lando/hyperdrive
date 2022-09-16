
const {BaseCommand} = require('../lib/base-command');
const {CliUx, Flags} = require('@oclif/core');

const {sort, filter} = CliUx.ux.table.flags();

class PluginList extends BaseCommand {
  static description = 'lists valid plugins for given context';
  static examples = [
    'hyperdrive list',
    'hyperdrive list --global',
    'hyperdrive list -g --json',
  ];

  static flags = {
    filter,
    global: Flags.boolean({
      char: 'g',
      description: 'force use of global context',
      default: false,
    }),
    sort,
    ...BaseCommand.globalFlags,
  };

  async run() {
    // modes
    const sortBy = require('lodash/sortBy');
    // get args and flags
    const {flags} = await this.parse(PluginList);
    // get needed helpers things
    const {hyperdrive, app, context} = this.config;
    // get the correct plugin loading command
    const plugins = context.app ? app.getPlugins() : hyperdrive.getPlugins();

    // filter out invalid and hidden plugins
    const rows = sortBy(Object.keys(plugins)
    .map(name => ({name, ...plugins[name]}))
    .filter(row => row.isInstalled), 'name');

    // if JSON then return here
    if (flags.json) return rows;

    // otherwise cli table it
    this.log();
    // @TODO: add support for table flags
    CliUx.ux.table(rows, {name: {}, package: {}, type: {}, location: {}, version: {}}, flags);
    this.log();
    // also throw warnings if there are any invalid plugins
    for (const invalidPlugin of rows.filter(plugin => !plugin.isValid)) {
      this.warn(`${invalidPlugin.name} was detected at ${invalidPlugin.location} but does not seem to be a valid plugin!`);
    }

    this.log();
  }
}

module.exports = PluginList;
