const Config = require('./config');

class Bootstrapper {
  constructor(options = {}) {
    this.options = options;
  }

  async run() {
    return new Config(this.options);
  }
}

module.exports = Bootstrapper;
