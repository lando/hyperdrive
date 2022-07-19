const {BaseCommand} = require('../lib/base-command');
const {CliUx, Flags} = require('@oclif/core');
const Plugin = require('./../../core/plugin');

class ListCommand extends BaseCommand {
  static description = 'gets plugins for given context';
  static examples = [
    'hyperdrive config list',
    'hyperdrive config list --global',
    'hyperdrive config list -g --json',
  ];

  static flags = {
    ...BaseCommand.globalFlags,
    global: Flags.boolean({
      char: 'g',
      description: 'forces use of global context',
      default: true, // @todo: temporary until we get context detection working.
    }),
  };

  async run() {
    // load slower modules
    // @TODO: remove lodash in favor of mostly native
    const _ = require('lodash');
    // get args and flags
    const {flags} = await this.parse(ListCommand);
    // get helpers
    const {findPlugins, sortPlugins} = this.config.Bootstrapper;

    // @TODO: move this into lando class
    // @TODO: if lando is installed then get its config
    // @TODO: add try/catch in the lando class
    const {execa} = await import('execa'); // eslint-disable-line node/no-unsupported-features/es-syntax
    const {stdout} = await execa('lando', ['hyperdrive']);
    const landoConfig = JSON.parse(stdout);
    this.debug('acquired lando configuration %o', landoConfig);

    // scan any lando provided global directories for additional plugins
    const globalPluginDirs = landoConfig.pluginDirs
    .filter((dir => dir.type === 'global'))
    .map(dir => findPlugins(dir.dir, dir.depth))
    .flat(Number.POSITIVE_INFINITY);
    this.debug('found additional globally installed plugins in %o', globalPluginDirs);

    // iterate through globalPlugins and instantiate them
    // grab our plugin config
    // @NOTE: format and settings TBH still
    const channel = this.config.hyperdrive.get('core.release-channel');
    const pluginConfig = {channel, ...this.config.hyperdrive.get('plugins')};
    const globalPlugins = globalPluginDirs
    .map(dir => new Plugin(dir, pluginConfig))
    .map(plugin => ({...plugin, type: 'global'}));

    // determine app context or not, bootsrtrap method to load in complete landofile?
    // if app context then load in the landofiles using a bootstrap method?
    // remember that we need to load the main landofile first to get additional landofiles and hten bootsrap
    // the landofile config?
    // merge in app plugin stuff?

    // concat our plugins together, sort them and make them ready for display
    const plugins = _(sortPlugins([...landoConfig.plugins, ...globalPlugins]))
    .map((plugins, name) => ({...plugins[0], name}))
    .map(plugin => _.pick(plugin, ['name', 'package', 'type', 'location', 'version', 'isValid', 'isHidden', 'deprecated']))
    .sortBy('name')
    .value();

    // filter out invalid and hidden plugins
    const rows = plugins.filter(plugin => plugin.isValid && !plugin.isHidden);

    // if JSON then return here
    if (flags.json) return rows;

    // otherwise cli table it
    this.log();
    // @TODO: add support for table flags
    CliUx.ux.table(rows, {name: {}, package: {}, type: {}, location: {}, version: {}});
    this.log();
    // also throw warnings if there are any invalid plugins
    for (const invalidPlugin of plugins.filter(plugin => !plugin.isValid)) {
      this.warn(`${invalidPlugin.name} was located at ${invalidPlugin.location} but does not seem to be a valid plugin!`);
    }

    this.log();
  }
}

module.exports = ListCommand;
