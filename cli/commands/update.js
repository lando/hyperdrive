const {flags} = require('@oclif/command');
const {BaseCommand} = require('../lib/command');

class UpdateCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Update dependencies to their latest versions.

  Would be nice to have Lando check install status and, if updates are available, return a prompt that could trigger hyperdrive update.
  `;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

  // static aliases = ['uninstall'];

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
    const {flags} = this.parse(UninstallCommand);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
  }
}

module.exports = UninstallCommand;
