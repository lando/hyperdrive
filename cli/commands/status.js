const {BaseCommand} = require('../lib/base-command');

class Status extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `System checks to make sure Hyperdrive can operate correctly.

  - Docker Desktop Installed yes/no
  - Docker Desktop Version supported/unsupported
  - Can I run Docker commands?
  - Checking health of Docker Desktop install: RAM/CPU allocations, storage available, etc.;
  - Check needs update status`;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

  // static aliases = ['uninstall'];

  // static strict = false;
  // static parse = true;
  // static flags = {
  //   name: flags.string({char: 'n', description: 'name to print'}),
  // }

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  async run() {
    const {flags} = this.parse(Status);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
  }
}

module.exports = Status;
