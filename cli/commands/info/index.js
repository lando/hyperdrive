const {CliUx, Flags} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');

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
    all: Flags.boolean({
      description: 'show all information',
      default: false,
    }),
    ...BaseCommand.globalFlags,
  };

  async run() {
    /*
      // MVP plugin.yml
      name: name,
      description: info.description,
      releaseNotesUrl: 'https://URL/to/CHANGELOG.yml',
      // @todo: should we query for this?
      // installedVersion: this.isInstalled ? this.version : 'Not Installed',
      version: info.version,
      repositoryUrl: info.repository,
      author: info.author,
      contributors: info.maintainers,
      keywords: info.keywords,
    };
    */
    // mods
    const get = require('lodash/get');
    const prettify = require('../../../utils/prettify');
    // get args and flags
    const {argv, flags} = await this.parse(PluginInfo);
    // get needed helpers things
    const {hyperdrive, app, context} = this.config;
    // get the correct classes
    const Plugin = context.app ? app.Plugin : hyperdrive.Plugin;

    // try to get the info
    try {
      const result = await Plugin.info(argv[0]);

      // if this isnt all then truncate the info to the bare essentials
      const info = flags.all ? result : {
        name: result.name,
        description: result.description,
        version: result.version,
        author: result.author,
        contributors: result.maintainers,
        lando: result.lando,
        repository: result.repository,
      };

      // if we have JSON then just return what we have
      if (flags.json) return info;

      // otherwise construct some rows for tabular display
      const Config = context.app ? app.Config : hyperdrive.Config;
      const rows = Config.keys(info, {expandArrays: false}).map(key => ({key, value: get(info, key)}));
      // construct the column options
      const columns = {key: {}, value: {get: row => prettify(row.value)}};

      // print table
      this.log();
      CliUx.ux.table(rows, columns, {extended: flags.extended});
      this.log();

    // if we cannot get info then throw an error here
    } catch (error) {
      this.error(error);
    }
  }
}

module.exports = PluginInfo;
