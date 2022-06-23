const {Flags} = require('@oclif/core');
const {BaseCommand} = require('../lib/command');

class ConfigCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Configure Hyperdrive options. Options include...

  - Supported versions of Docker Desktop.
  - Default installed version of Docker Desktop.
  - Default version of Lando.
  - Default version of Docker Compose.
  - Whether you should install Docker Desktop at all.
  - Default release channel.
  - Specify a .npmrc file for global install.

  Topic with "hyperdrive config get/set/list"
  `;
  // static hidden - false;

  static usage = 'stuff';

  static help = 'stuff';

  // static aliases = ['uninstall'];

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
    const {flags} = this.parse(ConfigCommand);
    const name = flags.name || 'world';
    this.log(`hello ${name} from ./src/commands/hello.js`);
    // Instantiate hyperd
  }
}

module.exports = ConfigCommand;
