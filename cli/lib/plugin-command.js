const {Flags} = require('@oclif/core');
const {BaseCommand} = require('./base-command');

class PluginCommand extends BaseCommand {
  static args = [
    {
      name: 'plugin',
      required: true,
      description: 'the plugin(s)',
    },
  ];

  static flags = {
    global: Flags.boolean({
      char: 'g',
      description: 'force use of global context',
      default: false,
    }),
    namespace: Flags.string({
      hidden: true,
      char: 'n',
      description: 'force use of a particular namespace eg @namespace/plugin',
    }),
    ...BaseCommand.globalFlags,
  };
}

module.exports = {PluginCommand};
