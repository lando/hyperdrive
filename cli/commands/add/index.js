const {PluginCommand} = require('../../lib/plugin-command');

class PluginAdd extends PluginCommand {
  static description = 'adds a plugin';
  static examples = [
    'hyperdrive add @lando/apache',
    'hyperdrive add @lando/apache@^0.5.0',
    'hyperdrive add @lando/apache lando/php git://github.com/lando/drupal#main',
    'hyperdrive add @lando/apache --global',
  ];

  static args = [...PluginCommand.args];
  static flags = {...PluginCommand.flags};

  static strict = false;

  async run() {
    // mods
    const Listr = require('listr');
    // args and flags
    const {argv, flags} = await this.parse(PluginAdd);
    // get hyperdrive and app objects
    const {hyperdrive, app, context} = this.config;
    // pass this in to the listr context to collect plugin/error information
    const status = {plugins: [], errors: [], added: 0};

    // @TODO: check plugin-installer status and ask to install if needed
    // @TODO: add --non-interactive

    // construct listr tasks
    const tasks = new Listr([], {concurrent: true, exitOnError: false, renderer: flags.json ? 'silent' : 'default'});
    for (const name of argv) {
      tasks.add({
        title: `Adding ${name}`,
        task: async(ctx, task) => {
          try {
            // add the plugin
            task.plugin = context.app ? await app.addPlugin(name) : await hyperdrive.addPlugin(name);

            // if the plugin is not installed then run additional installation command
            if (!task.plugin.isInstalled) {
              task.title = `Installing ${task.plugin.name} deps`;
              await task.plugin.install();
            }

            // update and and return
            task.title = `Installed ${task.plugin.name}@${task.plugin.version}`;
            ctx.status.added++;
            return task.plugin;

          // if we have an error then add it to the status object and throw
          // @TODO: make sure we force remove any errered plugins?
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
      this.log('added %s of %s plugins with %s errors', status.added, status.plugins.length, status.errors.length);
      this.log();

      // handle errors here
      if (status.errors.length > 0) {
        // log the full error
        for (const error of status.errors) this.debug(error);
        this.error('Some plugins could not be installed correctly.', {
          suggestions: ['Run command again with --debug flag'],
          ref: 'https://docs.lando.dev/hyperdrive/cli/config.html#get',
          exit: 1,
        });
      }
    }
  }
}

module.exports = PluginAdd;
