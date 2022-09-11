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
    const {hyperdrive, app} = this.config;
    // get the context
    const appContext = app && !flags.global;
    // pass this in to the listr context to collect plugin information
    const plugins = [];

    // run the fetch tasks first
    const fetchs = new Listr([], {concurrent: true, exitOnError: false, renderer: flags.json ? 'silent' : 'default'});
    for (const name of argv) {
      fetchs.add({
        title: `Fetching ${name}`,
        task: async ctx => {
          // get the plugin and set it into context
          const plugin = appContext ? await app.fetchPlugin(name) : await hyperdrive.fetchPlugin(name);
          // add the plugin to the context so we can fetch it in the result
          ctx.plugins.push(plugin);
          // add the raw name for downstream stuff
          plugin.raw = name;
          // and return
          return plugin;
        },
      });
    }

    // try to fetch the plugins
    try {
      await fetchs.run({plugins});
    // if we have errors then lets print them out
    } catch ({errors}) {
      if (errors.length > 0) this.error('Some plugins could not be fetched. Look above for errors.');
    }

    // get list of uninstalled plugins
    const uninstalledPlugins = plugins.filter(plugin => plugin.isInstalled === false);
    // iterate through uninstalled plugins and run another listr for uninstalled plugins?
    if (uninstalledPlugins.length > 0) {
      this.log('Some plugins require dependency installation...');
      // @TODO: check plugin-installer status and ask to install if needed
      // @TODO: add --non-interactive

      // @TODO: install errors not showing, make sure we know what NRuns are returning?
      // @TODO: json output mode? listr-silent-renderer?
      // @TODO: fix installer package.json ENOENT bug

      // run the fetch tasks first
      const installs = new Listr([], {concurrent: true, exitOnError: false, renderer: flags.json ? 'silent' : 'default'});
      for (const uninstalledPlugin of uninstalledPlugins) {
        installs.add({
          title: `Installing ${uninstalledPlugin.raw}`,
          task: async() => {
            // get and set the plugin installer
            uninstalledPlugin.installer = appContext ?
              await app.getComponent('core.plugin-installer') : await hyperdrive.getComponent('core.plugin-installer');
            // and install
            return uninstalledPlugin.install();
          },
        }, {concurrent: true});
      }

      // try to fetch the plugins
      try {
        await installs.run();
      // if we have errors then lets print them out
      } catch ({errors}) {
        if (errors.length > 0) this.error('Some plugins could not be installed. Look above for errors.');
      }
    }

    // @TODO: modimodify the config file as needed?
    // @TODO: what about team context?
  }
}

module.exports = AddCommand;
