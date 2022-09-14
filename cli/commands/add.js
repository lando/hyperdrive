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
    const status = {plugins: [], errors: [], added: 0};

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
              await task.plugin.install();
            }

            // -> app type: detached by default?
            // attach command?
            //

            /*
            attach(installFile, manifest)
            */

            // -> pass in
            // -> checks for landofile first and modifies?
            // -> checks for manifest
            // -> how do we remove from manifest?

            // @TODO: where do we store the plugin manifest location?
            // @TODO: modify getStripped?
            // -> Plugin.manifestDump()?
            // @TODO: modimodify the config file as needed?

            // @TODO: can we resolve something like ^.0.5.0? YES?
            // @TODO: we need to resolve the tag and use ^version

            // @TODO: what about team context?

            // update and and return
            task.title = `Installed ${name}`;
            ctx.status.added++;
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

module.exports = AddCommand;
