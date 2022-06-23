const {Flags} = require('@oclif/core');
const {BaseCommand} = require('../lib/command');

class PluginCommand extends BaseCommand {
  static args = [
    {
      name: 'plugin',
      required: true,
      description: 'The plugin or dependency to install.',
    }
  ];

  static flags = {
    global: Flags.boolean({
      char: 'g',
      description: 'Add dependency to the global Lando context (default plugin for all projects).',
      default: false,
    }),
    namespace: Flags.string({
      char: 'n',
      description: 'Add dependency to the specified namespace context (default plugin for projects using the specified namespace).'
    }),
    // @todo: do we need a version flag, or should that be specified in the plugin string if necessary?
  };

  async init() {
    // console.log('INIT')
  }
}

module.exports = {PluginCommand};
