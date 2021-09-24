const {Command} = require('@oclif/command');

class AddCommand extends Command {
  static description = 'add things';

  static usage = 'usage';

  // static aliases = ['install'];

  static examples = [];

  async run() {
    const {flags} = this.parse(AddCommand);
    const name = flags.name || 'world';
    this.log(`goodbye ${name} from ./src/commands/hello.js`);
  }
}

module.exports = AddCommand;
