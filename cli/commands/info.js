const prettify = require('./../../utils/prettify');

const {CliUx, Flags} = require('@oclif/core');
const {BaseCommand} = require('../lib/base-command');

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
    ...BaseCommand.globalFlags,
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
    const sortBy = require('lodash/sortBy');

    // get hyperdrive stuff
    const {hyperdrive} = this.config;
    const Plugin = hyperdrive.getClass('plugin');

    const {args, flags} = await this.parse(InfoCommand);
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

module.exports = InfoCommand;
