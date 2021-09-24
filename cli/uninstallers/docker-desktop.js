const {Command, flags} = require('@oclif/command');

class UninstallDockerDesktop extends Command {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = 'remove dd'

  static hidden = true;

  static usage = 'stuff';

  static help = 'stuff';

  // static aliases = ['remove'];

  // static strict = false;
  // static parse = true;
  static flags = {
    purge: flags.string({char: 'p', description: 'blow it all up'}),
  }

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  async run() {
    this.log('unistnall docker-desktop');
  }
}

module.exports = UninstallDockerDesktop;
