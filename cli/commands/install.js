const {Command} = require('@oclif/command');

class InstallCommand extends Command {
  static description = 'install things';

  static usage = 'usage';

  static examples = [];

  async run() {
    const {flags} = this.parse(InstallCommand);
    const name = flags.name || 'world';
    this.log('install plugin');
  }
}

module.exports = InstallCommand;
