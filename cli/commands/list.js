const {BaseCommand} = require('../lib/base-command');
const {CliUx, Flags} = require('@oclif/core');
const LandoCLI = require('../../core/lando-cli');

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
    // get helpers
    const config = this.config.hyperdrive;

    const lando = new LandoCLI({...config.get('core'), ...config.get('lando')});

    // @TODO: if lando is not installed or is unsupported then throw an error?
    if (!lando.isInstalled || !lando.isSupported) {
      this.error('make this good later!');
    }

    // start by getting lando provided plugins
    const plugins = lando.getPlugins();
    this.debug('acquired lando provided plugins %o', plugins.map(plugin => `${plugin.name}@${plugin.version}`));

    // determine app context or not, bootsrtrap method to load in complete landofile?
    // if app context then load in the landofiles using a bootstrap method?
    // remember that we need to load the main landofile first to get additional landofiles and hten bootsrap
    // the landofile config?
    // merge in app plugin stuff?
    // console.log(lando.landofile)
    // console.log(lando.landofiles)
    // // @TODO: determine what the requirements are for "app found", any landofile? just .lando.yml?
    // process.exit(1)

    // filter out invalid and hidden plugins
    const rows = sortBy(plugins.filter(plugin => plugin.isValid && !plugin.isHidden), 'name');

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
