const {BaseCommand} = require('../lib/base-command');
const {Flags} = require('@oclif/core');

class ListCommand extends BaseCommand {
<<<<<<< HEAD
  static description = 'gets plugins for given context';
=======
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Shows all loaded dependencies for your current context, including their versions, whether they are locally installed, and if so where they're being loaded from.
  Have options for global and namespace.
  Have option --no-deps to remove Lando/Docker Desktop from the list.`;
  // static hidden - false;
>>>>>>> c64ef3432af23f3cbcfb8b0cb481fecddcede7fc

  // @TODO: global flag to force loading hte global context?
  // static args = [{
  //   name: 'key',
  //   description: 'config key(s) to get',
  //   required: false,
  // }];

  static examples = [
    'hyperdrive config list',
    'hyperdrive config list --global',
    'hyperdrive config list -g --json',
  ];

  // @TODO: global flag?
  static flags = {
    ...BaseCommand.globalFlags,
    global: Flags.boolean({
      char: 'g',
      description: 'forces use of global context',
      default: true, // @todo: temporary until we get context detection working.
    }),
  };

  // @TODO: do we need this?
  // static strict = false;

  async run() {
    // const {flags} = await this.parse(ListCommand);

    // @TODO: move this into lando class
    // @TODO: if lando is installed then get its config
    const {execa} = await import('execa'); // eslint-disable-line node/no-unsupported-features/es-syntax
    const {stdout} = await execa('lando', ['hyperdrive']);
    const landoConfig = JSON.parse(stdout);
    this.debug('acquired lando configuration %o', landoConfig);

    // scan any lando provided global directories for additional plugins
    const globalPlugins = landoConfig.pluginDirs
    .filter((dir => dir.type === 'global'))
    .map(dir => this.config.Bootstrapper.findPlugins(dir.dir, dir.depth))
    .flat(Number.POSITIVE_INFINITY);
    this.debug('found additional globally installed plugins in %o', globalPlugins);
    //
    // .flatten()
    // @TODO filter out files like .DS_STORE
    // @TODO figure out symlinks?
    // .filter()
    // .filter(path => fs.statSync(path).isDirectory())

    /*
      .map(dir => ([dir.dir, fs.readdirSync(path.resolve(__dirname, '..', '..', '..', dir.dir))]))
      .map(dir => _.map(dir[1], plugin => path.join(dir[0], plugin)))
    */

    // find plugins from other global/team dirs, use bootstrap method for this?
    // determine app context or not, bootsrtrap method to load in complete landofile?
    // if app context then load in the landofiles using a bootstrap method?
    // remember that we need to load the main landofile first to get additional landofiles and hten bootsrap
    // the landofile config?
    // merge in app plugin stuff?
    // @TODO: --json formatters etc
  }
}

module.exports = ListCommand;
