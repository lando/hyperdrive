const {Flags} = require('@oclif/core');
const {BaseCommand} = require('../lib/base-command');

class RemoveCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Remove a plugin or dependency from your Lando installation.

  Extra documentation goes here
  `;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

  // Check the OCLIF 2 standard static aliases = ['uninstall'];

  // static strict = false;
  // static parse = true;
  static flags = {
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  async run() {
    const {flags} = this.parse(RemoveCommand);
    const name = flags.name || 'unin';
    this.log(`erg ${name} from ./src/commands/hello.js`);
  }
}

module.exports = RemoveCommand;
