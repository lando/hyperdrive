const {loadHelpClass} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');

class ConfigCommand extends BaseCommand {
  static description = 'manages hyperdrive configuration';
  static flags = {
    ...BaseCommand.globalFlags,
  };

  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config, this.config.pjson.helpOptions);
    await help.showHelp(['config']);
  }
}

module.exports = ConfigCommand;
