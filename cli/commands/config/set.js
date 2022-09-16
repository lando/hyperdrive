const {BaseCommand} = require('../../lib/base-command');
const {Flags} = require('@oclif/core');

class ConfigSet extends BaseCommand {
  static description = 'sets configuration';
  static examples = [
    'hyperdrive config set core.telemetry=false',
    'hyperdrive config set core.telemetry=false updates.notify=false --global',
    'hyperdrive config set --config defaults.yaml',
  ];

  static strict = false;
  static args = [{
    name: 'key=value',
    description: 'config key(s) and their value(s) to set',
    required: false,
  }];

  static flags = {
    force: Flags.boolean({
      default: false,
      description: 'force setting of protected config',
      hidden: true,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'force use of global context',
      default: false,
    }),
    ...BaseCommand.globalFlags,
  };

  async run() {
    // mods and deps
    const chalk = require('chalk');
    const set = require('lodash/set');

    // args and flags
    const {argv, flags} = await this.parse(ConfigSet);

    // if no argv and no --config then throw error
    if (argv.length === 0 && !flags.config) {
      this.log();
      this.warn('you must specify a key=value or a config file! see help below');
      this.log();
      const {loadHelpClass} = require('@oclif/core');
      const Help = await loadHelpClass(this.config);
      const help = new Help(this.config, this.config.pjson.helpOptions);
      await help.showHelp(['config:set']);
    }

    // get hyperdrive and app objects
    const {hyperdrive, app} = this.config;
    // start with data from file or empty
    const data = hyperdrive.config.stores.overrides ? hyperdrive.config.get('overrides:') : {};

    // mix in argv if they have paths and values
    for (const arg of argv) {
      const path = arg.split('=')[0];
      const value = arg.split('=')[1];
      // if this a protect property then error
      if ((path.startsWith('system.') && !flags.force)) {
        this.error(`${path} is a protected config setting, we dont recommend you modify it!`, {
          suggestions: [
            `Use the hidden --force flag to set the config regardless. ${chalk.magenta('THIS IS USUALLY A BAD IDEA!')}`,
          ],
          ref: 'https://docs.lando.dev/hyperdrive/',
          exit: 1,
        });
      }

      // if we have a key and value then set it
      if (arg.split('=').length === 2) set(data, path, value);
    }

    // save result in the correct place
    if (app && !flags.global) {
      app.appConfig.save({config: data});
    } else {
      hyperdrive.config.save(data);
    }

    // if json then return the saved result
    if (flags.json) return data;
  }
}

module.exports = ConfigSet;
