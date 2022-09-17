const {PluginCommand} = require('../../lib/plugin-command');

class PluginRemove extends PluginCommand {
  static description = 'removes a plugin';
  static examples = [
    'hyperdrive remove @lando/apache',
    'hyperdrive remove @lando/apache@^0.5.0',
    'hyperdrive remove @lando/php @lando/apache --global',
  ];

  static args = [...PluginCommand.args];
  static flags = {...PluginCommand.flags};

  static strict = false;

  async run() {
    // mods
    const Listr = require('listr');
    // args and flags
    const {argv, flags} = await this.parse(PluginRemove);
    // get hyperdrive and app objects
    const {hyperdrive, app, context} = this.config;
    // pass this in to the listr context to collect plugin/error information
    const status = {plugins: [], errors: [], removed: 0};

    // run the fetch tasks first
    const tasks = new Listr([], {concurrent: true, exitOnError: false, renderer: flags.json ? 'silent' : 'default'});
    for (const name of argv) {
      tasks.add({
        title: `Removing ${name}`,
        task: async(ctx, task) => {
          try {
            // remove the plugin
            task.plugin = context.app ? await app.removePlugin(name) : await hyperdrive.removePlugin(name);
            // update and and return
            task.title = `Removed ${task.plugin.name}`;
            ctx.status.removed++;
            return task.plugin;

          // if we have an error then add it to the status object and throw
          } catch (error) {
            ctx.status.errors.push(error);
            throw error;

          // add the plugin regardless of the status
          } finally {
            ctx.status.plugins.push(task.plugin);
          }
        },
      });
    }

    // try to fetch the plugins
    try {
      await tasks.run({status});
      // json response
      if (flags.json) return status;

    // if we have errors then lets print them out
    } finally {
      // otherwise
      this.log();
      this.log('removed %s of %s plugins with %s errors', status.removed, status.plugins.length, status.errors.length);
      this.log();

      // handle errors here
      if (status.errors.length > 0) {
        // log the full error
        for (const error of status.errors) this.debug(error);
        this.error('Some plugins could not be removed correctly.', {
          suggestions: ['Run command again with --debug flag'],
          ref: 'https://docs.lando.dev/hyperdrive/cli/config.html#get',
          exit: 1,
        });
      }
    }
  }
}

module.exports = PluginRemove;
