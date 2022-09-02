const {PluginCommand} = require('../lib/plugin-command');

class AddCommand extends PluginCommand {
  static description = 'installs a plugin';
  static examples = [
    'hyperdrive add @lando/apache@0.5.0',
    'hyperdrive add @lando/apache@edge',
    'hyperdrive add @lando/apache --global',
  ];

  static args = [...PluginCommand.args];
  static flags = {...PluginCommand.flags};

  static strict = false;

  async run() {
    // mods
    const path = require('path');
    const Listr = require('listr');
    // args and flags
    const {argv, flags} = await this.parse(AddCommand);
    // get hyperdrive and app objects
    const {hyperdrive, app} = this.config;
    // @TODO: replaec defaults no arg error with no argv maybe suggest hyperdrive install?

    const engine = await hyperdrive.getComponent('core.engine');

    const result = await engine.run(['bash', '-c', 'apt update && apt install vim -y'], {image: 'ubuntu', attach: false})

    console.log(result)
    process.exit(1)
    // try {
    //   await engine.run([
    //     'node', '-e', "console.log(require('os').arch()); console.error(require('os').platform()); process.exit(3);",
    //   ]);
    //   // await engine.run(['echo'])

    // } catch (error) {
    //   console.log(error);
    //   this.exit(error.exitCode)
    // }

    // @TODO: move to listr?
    const tasks = new Listr([], {concurrent: true, exitOnError: false});
    for (const plugin of argv) {
      tasks.add({
        title: `Installing ${plugin}`,
        task: async() => {
          return (app && !flags.global) ? app.installPlugin(plugin) : hyperdrive.installPlugin(plugin);
        },
      });
    }

    // @TODO: need to try catch this
    await tasks.run();

    // @TODO: modimodify the config file as needed?
    // @TODO: what about team context?
    // @TODO: what happens if we pull down a plugin that is not a lando plugin?
  }
}

module.exports = AddCommand;
