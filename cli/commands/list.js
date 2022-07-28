
const {BaseCommand} = require('../lib/base-command');
const {CliUx, Flags} = require('@oclif/core');

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
    // modes
    const sortBy = require('lodash/sortBy');
    // get args and flags
    const {flags} = await this.parse(ListCommand);
    // get needed helpers things
    const {appFile, bootstrap, hyperdrive, lando} = this.config;
    // get lando CLI component and config from registry
    const [LandoCLI, landoCLIConfig] = bootstrap.getComponent('core.lando');
    // create lando cli instance by merging together various config sources
    const landoCLI = new LandoCLI({...hyperdrive.get('core'), ...landoCLIConfig, ...lando.get(`${landoCLIConfig.bin}.lando`)});

    // if lando is not installed or is unsupported then throw an error?
    // @TODO: lando should use id to reflect changes?
    if (!landoCLI.isInstalled) {
      this.error(`${LandoCLI.name} is not installed! or cannot be detected.`, LandoCLI.notInstalledError);
    }

    // unsupported error
    // @TODO: lando should use id to reflect changes?
    if (!landoCLI.isSupported) {
      this.error(`${LandoCLI.name} is installed but hyperdrive needs version 3.6.5 or higher`, LandoCLI.notSupportedError);
    }

    // start by getting lando provided plugins
    const plugins = landoCLI.getPlugins();
    this.debug('acquired lando provided plugins %o', plugins.map(plugin => `${plugin.name}@${plugin.version}`));

    // determine app context or not, bootsrtrap method to load in complete landofile?
    if (appFile) {
      const [MinApp] = bootstrap.getComponent('core.app');
      const app = new MinApp(appFile, {...hyperdrive.get(), ...lando.get(landoCLIConfig.bin)});
      this.debug(app);
    }

    // organize plugins so that load order is reflected
    const organizedPlugins = bootstrap.collapsePlugins(bootstrap.groupPlugins(plugins));

    // filter out invalid and hidden plugins
    const rows = sortBy(organizedPlugins.filter(plugin => plugin.isValid && !plugin.isHidden), 'name');

    // if JSON then return here
    if (flags.json) return rows;

    // otherwise cli table it
    this.log();
    // @TODO: add support for table flags
    CliUx.ux.table(rows, {name: {}, package: {}, type: {}, location: {}, version: {}});
    this.log();
    // also throw warnings if there are any invalid plugins
    for (const invalidPlugin of plugins.filter(plugin => !plugin.isValid)) {
      this.warn(`${invalidPlugin.name} was detected at ${invalidPlugin.location} but does not seem to be a valid plugin!`);
    }

    this.log();
  }
}

module.exports = ListCommand;
