const {Command, flags} = require('@oclif/command');

class InstallDockerDesktop extends Command {
  // static _base = 'thing';
  static id = 'install';
  // static title = 'title';

  static description = 'install docker desktop';

  static hidden = true;

  static usage = 'stuff';

  static help = 'stuff';

  // static strict = false;
  // static parse = true;
  static flags = {
    mem: flags.string({char: 'm', description: 'mem for vm'}),
  }

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  async run() {
    this.log('install docker-desktop');
  }
}

module.exports = InstallDockerDesktop;
