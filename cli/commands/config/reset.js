const {BaseCommand} = require('../../lib/base-command');

class ConfigReset extends BaseCommand {
  static description = 'resets configuration to defaults';
  static hidden = true

  async run() {
    // mods
    const fs = require('fs');
    // hyperdrive
    const {hyperdrive} = this.config;

    // loop through and remove config stores
    for (const [store, data] of Object.entries(hyperdrive.config.stores)) {
      if (data && data.type === 'file') {
        this.debug('resetting %s config at %o', store, data.file);
        try {
          fs.unlinkSync(data.file);
        } catch (error) {
          this.error(error);
        }
      }
    }
  }
}

module.exports = ConfigReset;
