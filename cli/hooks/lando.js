const chalk = require('chalk');
const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:config');
const fs = require('fs');
const get = require('lodash/get');
const has = require('lodash/has');
const path = require('path');

module.exports = async({config}) => {
  debug('config event works!');
  const {hyperdrive} = config;
  // get some stuff we need
  const {core, plugin, system} = hyperdrive.config.get();
  // get the core classes we need
  const LandoCLI = hyperdrive.getClass('core.lando');
  // deconstruct some defaults
  const {configCommand, bin} = LandoCLI.defaults;

  // dump the landoconfig file if we have to and rebase our managed config on it
  if (!core.landofile || !core.landofiles || !plugin.globalInstallDir || core.autoSync) {
    // run the config get command
    const result = get(LandoCLI.info(configCommand), bin);

    // if we dont have the props we need then throw something?
    for (const prop of ['app.landofile', 'app.landofiles', 'lando.globalPluginDir']) {
      if (!has(result, prop)) debug(`${chalk.red('could not')} find %o in the result from %o, using the default`, prop, configCommand);
    }

    // get what we need from lando config and
    const managedConfig = hyperdrive.config.stores[hyperdrive.config.managed].get();
    const data = {
      core: {
        landofile: get(result, 'app.landofile', '.lando'), ...managedConfig.core,
        landofiles: get(result, 'app.landofiles', ['base', 'dist', 'recipe', 'upstream', '', 'local', 'user']), ...managedConfig.core,
      },
      plugin: {
        'global-install-dir': get(result, 'lando.globalPluginDir', path.join(system.home, '.lando', 'plugins')), ...managedConfig.plugins,
      },
    };

    // rebase lando config data on managed store
    hyperdrive.config.save(data);
    hyperdrive.config.defaults(data);
  }

  // add the plugins into the config
  if (fs.existsSync(system.landoConfig)) {
    const Plugin = hyperdrive.getClass('plugin');
    const {bin} = LandoCLI.defaults;
    const landoConfig = require(system.landoConfig)[bin].lando;

    // mix in other global plugins
    // @TODO: as the amount of global plugins goes up the more this will slow EVERYTHING down
    // how should be optimize? cache the list of global plugins? bust cache when new plugin is added/removed/updated?
    const globalPlugins = landoConfig.pluginDirs
    .filter(dir => dir.type === 'global')
    .map(dir => ({type: dir.type, dirs: hyperdrive.bootstrap.findPlugins(dir.dir, dir.depth)}))
    .map(dirs => dirs.dirs.map(dir => new Plugin({root: dir, type: dirs.type})))
    .flat(Number.POSITIVE_INFINITY);

    // concat all plugins together
    landoConfig.plugins = [...landoConfig.plugins, ...globalPlugins];
    hyperdrive.lando = landoConfig;
  }

  // get the lando file
  const landofile = core.landofile;
  // try to discover if we have app context or not
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const landofilePath = hyperdrive.bootstrap.findApp(landofiles, process.cwd());

  // if we have an file then lets set it in the config for downstream purposes
  if (landofilePath) {
    // what does hyperdrive need for most downstream things?
    // the status of the config? app.config vs hyperdrive.config?
    // the list of plugins?

    // how does minapp loading happen?
    // minapp should legit just load landofiles and mix in any global things
    // 1. set the static props defaults = config plugins = lando plugins
    // 2. constructor will need to:
    //    a. load in initial landofile
    //    b. assess whether we have initial landofiles to load
    //    c. assemble the landofiles together in a CONFIG: TBD on relationship with global config?
    //    d. get the plugin info and add it to App.plugins?
    //    e. cache results of stuff? how is cache loading going to work for config/plugins in lando/

    hyperdrive.landofile = landofilePath;
    hyperdrive.config.set('app.landofile', hyperdrive.landofile);
    debug('detected a landofile file at %o', hyperdrive.landofile);
  }
};
