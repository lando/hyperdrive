const {Command} = require('@oclif/command');

class UninstallCommand extends Command {
  static description = 'install things';

  static usage = 'usage';

  // static aliases = ['install'];

  static examples = [];

  async run() {
    const {flags} = this.parse(UninstallCommand);
    const name = flags.name || 'world';
    this.log(`goodbye ${name} from ./src/commands/hello.js`);
  }
}

module.exports = UninstallCommand;
