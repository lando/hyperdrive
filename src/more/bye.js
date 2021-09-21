const {Command, flags} = require('@oclif/command');

class GoodbyeCommand extends Command {
  async run() {
    const {flags} = this.parse(GoodbyeCommand);
    const name = flags.name || 'world';
    console.log(flags);
    this.log(`FU ${name} from ./src/commands/hello.js`);
  }
}
GoodbyeCommand.name = 'bye';
GoodbyeCommand.description = `awsgwag the command here
...
Extra documentation goes here
`;

GoodbyeCommand.flags = {
  name: flags.string({char: 'q', description: 'name to print'}),
};

GoodbyeCommand.hidden = false;

module.exports = GoodbyeCommand;
