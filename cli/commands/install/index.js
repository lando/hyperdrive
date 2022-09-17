const parsePkgName = require('../../../utils/parse-package-name');

const {BaseCommand} = require('../../lib/base-command');

class Install extends BaseCommand {
  static description = 'adds all plugins for an app';
  static flags = {...BaseCommand.globalFlags};
  static usage = 'install [CMD] [ARGS] [OPTIONS]';

  async run() {
    // mods
    const Listr = require('listr');
    // get args and flags
    const {argv, flags} = await this.parse(Install);
    // get needed helpers things
    const {app, context, pjson} = this.config;

    // if no argv and not app context then throw warning and print help
    if (context.global && argv.length === 0) {
      this.log();
      this.warn('CANNOT RUN IN GLOBAL CONTEXT');
      this.log();
      const {loadHelpClass} = require('@oclif/core');
      const Help = await loadHelpClass(this.config);
      const help = new Help(this.config, pjson.helpOptions);
      await help.showHelp(['install']);
    }

    // @TODO: check plugin-installer status and ask to install if needed
    // @TODO: add --non-interactive

    // pass this in to the listr context to collect plugin/error information
    const plugins = app.appConfig.getUncoded('plugins');
    const status = {plugins: [], errors: [], added: 0};
    // construct listr tasks
    const tasks = new Listr([], {concurrent: true, exitOnError: false, renderer: flags.json ? 'silent' : 'default'});
    for (let [name, source] of Object.entries(plugins)) {
      // @TODO: skip local plugins
      // if (fs.existsSync(path.join(app.pluginsDir, name))) continue;

      // add the rest
      tasks.add({
        title: `Adding ${name}`,
        task: async(ctx, task) => {
          try {
            // figure out what to request
            const pkg = parsePkgName(source);
            // if we have a range or tag then reset source
            if (pkg.type === 'range' || pkg.type === 'tag') {
              source = `${name}@${source}`;
            }

            // add the plugin
            task.plugin = await app.addPlugin(source);

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

module.exports = Install;
