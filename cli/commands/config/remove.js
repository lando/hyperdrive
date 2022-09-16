const {BaseCommand} = require('../../lib/base-command');
const {Flags} = require('@oclif/core');

class ConfigRemove extends BaseCommand {
  static description = 'removes configuration';
  static examples = [
    'hyperdrive config remove ',
    'hyperdrive config remove core.telemetry updates.notify --global',
  ];

  static strict = false;
  static args = [{
    name: 'key',
    description: 'config key(s) to unset',
    required: false,
  }];

  static flags = {
    global: Flags.boolean({
      char: 'g',
      description: 'force use of global context',
      default: false,
    }),
    ...BaseCommand.globalFlags,
  };

  async run() {
    // args and flags
    const {argv, flags} = await this.parse(ConfigRemove);

    // if no argv and no --config then throw error
    if (argv.length === 0 && !flags.config) {
      this.log();
      this.warn('you must specify a key=value or a config file! see help below');
      this.log();
      const {loadHelpClass} = require('@oclif/core');
      const Help = await loadHelpClass(this.config);
      const help = new Help(this.config, this.config.pjson.helpOptions);
      await help.showHelp(['config:remove']);
    }

    // get hyperdrive and app objects
    const {hyperdrive, app, context} = this.config;

    // mix in argv if they have paths and values
    for (const key of argv) {
      // if this a protected property then warn
      if (key.startsWith('system.')) this.warn(`${key} is protected config and cannot be removed.`);
      // loop through and remove for the correct context
      if (context.app) {
        app.appConfig.remove(`config.${key}`);
      } else {
        hyperdrive.config.remove(key);
      }
    }

    // if json then return the removed result
    if (flags.json) return argv;
  }
}

module.exports = ConfigRemove;
