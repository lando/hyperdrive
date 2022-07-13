const {Flags} = require('@oclif/core');
const {BaseCommand} = require('../lib/base-command');

class ListCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Shows all loaded dependencies for your current context, including their versions, whether they are locally installed, and if so where they're being loaded from.
  Have options for global and namespace.
  Have option --no-deps to remove Lando/Docker Desktop from the list.`;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

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
    const {flags} = this.parse(ListCommand);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
  }
}

module.exports = ListCommand;
