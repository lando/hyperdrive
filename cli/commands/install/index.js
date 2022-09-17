const {loadHelpClass} = require('@oclif/core');
const {BaseCommand} = require('../../lib/base-command');

class Install extends BaseCommand {
  static description = 'adds all plugins for an app';
  static flags = {...BaseCommand.globalFlags};
  static usage = 'install [CMD] [ARGS] [OPTIONS]';

  async run() {
    const Help = await loadHelpClass(this.config);
    const help = new Help(this.config, this.config.pjson.helpOptions);
    await help.showHelp(['install']);
  }
}

module.exports = Install;
