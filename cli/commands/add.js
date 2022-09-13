const {PluginCommand} = require('../lib/plugin-command');

class AddCommand extends PluginCommand {
  static description = 'installs a plugin';
  static examples = [
    'hyperdrive add @lando/apache@0.5.0',
    'hyperdrive add @lando/apache@edge',
    'hyperdrive add @lando/apache --global',
    'hyperdrive add @lando/apache @lando/php -g',
  ];

  static args = [...PluginCommand.args];
  static flags = {...PluginCommand.flags};

  static strict = false;

  async run() {
    // mods
    const Listr = require('listr');
    // args and flags
    const {argv, flags} = await this.parse(AddCommand);
    // get hyperdrive and app objects
    const {hyperdrive, app, context} = this.config;
    // pass this in to the listr context to collect plugin/error information
    const status = {plugins: [], errors: []};

    // @TODO: check plugin-installer status and ask to install if needed
    // @TODO: add --non-interactive

    // run the fetch tasks first
    const fetchs = new Listr([], {concurrent: true, exitOnError: false, renderer: flags.json ? 'silent' : 'default'});
    for (const name of argv) {
      fetchs.add({
        title: `Fetching ${name}`,
        task: async(ctx, task) => {
          try {
            // download the plugin
            task.plugin = context.app ? await app.fetchPlugin(name) : await hyperdrive.fetchPlugin(name);
            // add the raw name for downstream stuff
            task.plugin.raw = name;

            // if the plugin is not installed then run additional installation command
            if (!task.plugin.isInstalled) {
              task.title = `Installing ${name} deps`;
              const installer = 'core.plugin-installer';
              task.plugin.installer = context.app ? app.getComponent(installer) : await hyperdrive.getComponent(installer);
              await task.plugin.install();
            }

            // and return
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
      await fetchs.run({status});
    // if we have errors then lets print them out
    } catch ({errors}) {
      // ADD SUGGESTIONS HERE: docker-restart/run with debug
      if (errors.length > 0) this.error('Some plugins could not be installed correctly. Look above for errors.');
    }

    // @TODO: modimodify the config file as needed?
    // @TODO: what about team context?
  }
}

module.exports = AddCommand;
