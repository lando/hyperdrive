const {Command, flags} = require('@oclif/command');

class UninstallCommand extends Command {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Describe the command here

  Extra documentation goes here
  `;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

  static aliases = ['uninstall'];

  // static strict = false;
  // static parse = true;
  static flags = {
    name: flags.string({char: 'n', description: 'name to print'}),
  }

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  static flags = {
    name: flags.string({char: 'n', description: 'name to print'}),
  }

  async run() {
    const {flags} = this.parse(UninstallCommand);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
  }
}

module.exports = UninstallCommand;
