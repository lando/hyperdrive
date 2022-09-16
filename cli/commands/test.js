const {Command} = require('@oclif/core');

class Test extends Command {
  static hidden = true
  async run() {
    this.log('test');
  }
}

module.exports = Test;
