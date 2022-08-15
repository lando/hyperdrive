
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
    const {hyperdrive} = this.config;
    // get lando cli component
    const landoCLI = await hyperdrive.getComponent('core.lando', hyperdrive.lando);

    // if lando is not installed or is unsupported then throw an error?
    // @TODO: lando should use id to reflect changes?
    if (!landoCLI.isInstalled) {
      this.error(`${landoCLI.name} is not installed! or cannot be detected.`, landoCLI.notInstalledError());
    }

    // unsupported error
    // @TODO: lando should use id to reflect changes?
    if (!landoCLI.isSupported) {
      const required = landoCLI.required;
      this.error(`${landoCLI.name} is installed but ${hyperdrive.get('core.id')} needs version ${required}`, landoCLI.notSupportedError());
    }

    // determine app context or not
    // if (landofile) {
    //   const [MinApp] = bootstrap.getComponent('core.app');
    //   const app = new MinApp(landofile, hyperdrive.get());
    //   this.debug(app);
    // }

    // get our plugins
    const plugins = hyperdrive.plugins.get();

    // filter out invalid and hidden plugins
    const rows = sortBy(Object.keys(plugins).map(name => ({name, ...plugins[name]})), 'name');

    // if JSON then return here
    if (flags.json) return rows;

    // otherwise cli table it
    this.log();
    // @TODO: add support for table flags
    CliUx.ux.table(rows, {name: {}, package: {}, type: {}, location: {}, version: {}});
    this.log();
    // also throw warnings if there are any invalid plugins
    for (const invalidPlugin of hyperdrive.plugins.filter(plugin => !plugin.isValid)) {
      this.warn(`${invalidPlugin.name} was detected at ${invalidPlugin.location} but does not seem to be a valid plugin!`);
    }

    this.log();
  }
}

module.exports = ListCommand;
