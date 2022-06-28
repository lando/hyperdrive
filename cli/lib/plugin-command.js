const {Flags} = require('@oclif/core');
const {BaseCommand} = require('./command');

class PluginCommand extends BaseCommand {
  static args = [
    {
      name: 'plugin',
      required: true,
      description: 'The plugin or dependency to act on.',
    }
  ];

  static flags = {
    global: Flags.boolean({
      char: 'g',
      description: 'Modify the global Lando context (defaults for all projects).',
      default: true, //@todo: temporary until we get context detection working.
    }),
    namespace: Flags.string({
      char: 'n',
      description: 'Modify the specified namespace context (defaults for projects using the namespace).'
    }),
    // @todo: do we need a version flag, or should that be specified in the plugin string if necessary?
  };

  async init() {
    // console.log('INIT')
  }
}

module.exports = {PluginCommand};
