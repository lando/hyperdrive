const chalk = require('chalk');
const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:config');
const fs = require('fs');
const get = require('lodash/get');
const has = require('lodash/has');
const path = require('path');

module.exports = async({config}) => {
  debug('config event works!');
  // get some stuff we need
  const {core, plugin, system} = config.hyperdrive.get();
  // get the core classes we need
  const LandoCLI = config.bootstrap.getClass('core.lando');
  const Plugin = config.bootstrap.getClass('plugin');
  // deconstruct some defaults
  const {configCommand, bin} = LandoCLI.defaults;

  // dump the landoconfig file if we have to and rebase our managed config on it
  if (!core.landofile || !core.landofiles || !plugin.globalInstallDir || core.autoSync) {
    // run the config get command
    const result = get(LandoCLI.info(configCommand), bin);

    // if we dont have the props we need then throw something?
    for (const prop of ['app.landofile', 'lando.globalPluginDir']) {
      if (!has(result, prop)) debug(`${chalk.red('could not')} find %o in the result from %o, using the default`, prop, configCommand);
    }

    // get what we need from lando config and
    const managedConfig = config.hyperdrive.stores[config.hyperdrive.managed].get();
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
    config.hyperdrive.save(data);
    config.hyperdrive.defaults(data);
  }

  // add the plugins into the config
  if (fs.existsSync(system.landoConfig)) {
    const {bin} = LandoCLI.defaults;
    const landoConfig = require(system.landoConfig)[bin].lando;

    // mix in other global plugins
    const globalPlugins = landoConfig.pluginDirs
    .filter(dir => dir.type === 'global')
    .map(dir => ({type: dir.type, dirs: config.bootstrap.findPlugins(dir.dir, dir.depth)}))
    .map(dirs => dirs.dirs.map(dir => new Plugin({root: dir, type: dirs.type})))
    .flat(Number.POSITIVE_INFINITY);

    // concat all plugins together
    landoConfig.plugins = [...landoConfig.plugins, ...globalPlugins];
    config.lando = landoConfig;
  }

  // get the lando file
  const landofile = core.landofile;
  // try to discover if we have app context or not
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const landofilePath = config.bootstrap.findApp(landofiles, process.cwd());

  // if we have an file then lets set it in the config for downstream purposes
  if (landofilePath) {
    config.landofile = landofilePath;
    config.hyperdrive.set('app.landofile', config.landofile);
    debug('detected a landofile file at %o', config.landofile);
  }
};
