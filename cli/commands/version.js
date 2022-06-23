const {BaseCommand} = require('../lib/command');

class VersionCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Return the version of Hyperdrive. CHECK IF OCLIF HAS DEFAULT?

  Extra documentation goes here
  `;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

  // static aliases = ['uninstall'];

  // static strict = false;
  // static parse = true;
  static flags = {}

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  async run() {
    const {flags} = this.parse(VersionCommand);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
  }
}

module.exports = VersionCommand;
