const chalk = require('chalk');
const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:config');
const get = require('lodash/get');
const has = require('lodash/has');
const path = require('path');

module.exports = async({config}) => {
  debug('config event works!');
  // get some stuff we need
  const {core, plugins, system} = config.hyperdrive.get();

  // dump the landoconfig file if we have to and rebase our managed config on it
  if (!core.landofile || !plugins.globalInstallDir || core.autoSync) {
    // get the lando CLI component and deconstruct config
    const [LandoCLI, landoCLIConfig] = config.bootstrap.getComponent('core.lando');
    const {configCommand, bin} = landoCLIConfig;

    // run the config get command
    const result = get(LandoCLI.getCmd(configCommand), bin);

    // if we dont have the props we need then throw something?
    for (const prop of ['app.landofile', 'lando.globalPluginDir']) {
      if (!has(result, prop)) debug(`${chalk.red('could not')} find %o in the result from %o, using the default`, prop, configCommand);
    }

    // get what we need from lando config and
    const data = {
      core: {
        landofile: get(result, 'app.landofile', '.lando'),
      },
      plugins: {
        globalInstallDir: get(result, 'lando.globalPluginDir', path.join(system.home, '.lando', 'plugins')),
      },
    };

    // rebase lando config data on managed store
    const managedConfig = config.hyperdrive.stores[config.hyperdrive.managed].get();
    config.hyperdrive.save({...data, ...managedConfig});
    config.hyperdrive.defaults({...data, ...managedConfig});
  }

  // get the lando file
  const landofile = config.hyperdrive.get('core.landofile');
  // try to discover if we have app context or not
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const landofilePath = config.bootstrap.findApp(landofiles, process.cwd());

  // if we have an file then lets set it in the config for downstream purposes
  if (landofilePath) {
    config.landofile = landofilePath;
    debug('detected a landofile file at %o', config.landofile);
  }
};
