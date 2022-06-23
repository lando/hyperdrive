const {Command} = require('@oclif/core');

class TestCommand extends Command {
  static hidden = true
  async run() {
    this.log('test');
  }
}

module.exports = TestCommand;
