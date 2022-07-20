const fs = require('fs');

const {BaseCommand} = require('../../lib/base-command');

class ConfigCommandReset extends BaseCommand {
  static description = 'resets hyperdrive configuration to defaults';
  static hidden = true
  static strict = false;

  async run() {
    const stores = this.config.hyperdrive.stores;
    for (const store in stores) {
      if (stores[store] && stores[store].type === 'file') {
        const file = stores[store].file;
        this.debug('resetting config at %s', file);
        fs.unlinkSync(file);
      }
    }
  }
}

module.exports = ConfigCommandReset;
