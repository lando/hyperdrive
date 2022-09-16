const {loadHelpClass} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');

class Config extends BaseCommand {
  static description = 'manages configuration';
  static flags = {...BaseCommand.globalFlags};
  static usage = 'config [CMD] [-c <value>] [--debug] [--help] [--json]';

  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config, this.config.pjson.helpOptions);
    await help.showHelp(['config']);
  }
}

module.exports = Config;
