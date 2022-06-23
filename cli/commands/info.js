const {flags} = require('@oclif/command');
const {BaseCommand} = require('./lib/command');

class InfoCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Shows information including downloaded version, latest available version, brief text description, etc. for the dependencies loaded dependencies for your current context, including their version, where they're being loaded from, and their context (app vs. global).
  Have options for global and namespace.
  Have option --no-deps to remove Lando/Docker Desktop from the list.`;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

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

  async run() {
    const {flags} = this.parse(InfoCommand);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
  }
}

module.exports = InfoCommand;
