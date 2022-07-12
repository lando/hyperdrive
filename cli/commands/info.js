const {CliUx, Flags} = require('@oclif/core');
const {BaseCommand} = require('../lib/base-command');
const Plugin = require('../../core/plugin');

class InfoCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = 'Shows information including downloaded version, latest available version, brief text description, etc. for the dependencies loaded dependencies for your current context, including their version, where they\'re being loaded from, and their context (app vs. global).';
  // static hidden - false;

  static usage = [
    'lando info',
    'lando info --no-deps',
    'lando info -g',
    'lando info -n my-namespace',
  ];

  static args = [
    {
      name: 'plugin',
      required: true,
      description: 'The plugin or dependency to get info about.',
    },
  ];

  // static strict = false;
  // static parse = true;
  static flags = {
    'no-deps': Flags.boolean({
      description: 'Remove non-plugin dependencies (IE Lando core and Docker Desktop) from the list.',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'Show plugins and dependencies installed in the global Lando context (defaults used for all projects).',
      default: false,
    }),
    namespace: Flags.string({
      char: 'n',
      description: 'Show installed plugins in the specified namespace context (defaults used for projects using the namespace).',
    }),
  };

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  async run() {
    const _ = require('lodash');
    const keys = require('all-object-keys');
    const {args, flags} = await this.parse(InfoCommand);
    const pluginName = `/${args.plugin}`;
    const home = this.config.home;
    const pluginsFolder = `${home}/.lando/plugins`;
    const plugin = new Plugin(pluginName, pluginsFolder);
    const data = await plugin.info();
    if (flags.json) return data;

    // Use key extraction logic from config.js
    const tableKeys = keys(data);
    const tableRows = _(tableKeys)
    .filter(path => _.includes(tableKeys, path))
    .map(path => ({key: path, value: _.get(data, path)}))
    .sortBy('key', 'DESC')
    .value();

    CliUx.ux.table(tableRows, {key: {}, value: {}});
  }
}

module.exports = InfoCommand;
