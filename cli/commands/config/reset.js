const fs = require('fs');

const {BaseCommand} = require('../../lib/base-command');

class ConfigCommandReset extends BaseCommand {
  static description = 'resets hyperdrive configuration to defaults';
  static hidden = true;
  static strict = false;

  async run() {
    const _ = require('lodash');

    // get list of files to remove
    const files = _(this.config.hyperdrive.stores)
    .filter(store => store.type === 'file')
    .map(store => store.file)
    .value();

    // remove them
    for (const file of files) {
      fs.unlinkSync(file);
    }
  }
}

module.exports = ConfigCommandReset;
