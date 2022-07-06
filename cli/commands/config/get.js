const {Flags} = require('@oclif/core');
const {BaseCommand} = require('../../lib/BaseCommand');

class ConfigCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Retrieve a specific config value.`;
  // static hidden - false;

  static flags = [
    ''
  ];

  static args = [
    'value',
  ];


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
    const {fs} = require('fs');
    const {nconf} = require('nconf');
    console.log(this.config);
    // Fetch the default config.yml

    // Fetch the userspace configDir (/Users/alec/.config/hyperdrive)
    // eemeli/yaml should be our new YAML library

    // Merge the config (nconf)

    // Cache the combined config in oclif's cacheDir as JSON (nconf)

  }
}

module.exports = ConfigCommand;
