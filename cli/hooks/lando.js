const chalk = require('chalk');
const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-config-pre');
const fs = require('fs');
const get = require('lodash/get');
const has = require('lodash/has');
const path = require('path');

module.exports = async({config}) => {
  const {hyperdrive} = config;
  // get some stuff we need
  const {core, plugin, system} = hyperdrive.config.get();
  // get the core classes we need
  const LandoCLI = hyperdrive.getClass('core.lando');
  // deconstruct some defaults
  const {configCommand, bin} = LandoCLI.defaults;

  // dump the landoconfig file if we have to and rebase our managed config on it
  if (!core.landofile || !core.landofiles || !plugin.globalDir || !plugin.userDir || !plugin.globalManifest || core.autoSync) {
    // run the config get command
    const result = get(LandoCLI.info(configCommand), bin);

    // if we dont have the props we need then throw something?
    for (const prop of ['app.landofile', 'app.landofiles', 'lando.globalDir', 'lando.userDir']) {
      if (!has(result, prop)) debug(`${chalk.red('could not')} find %o in the result from %o, using the default`, prop, configCommand);
    }

    // get what we need from lando config and
    const globalDir = get(result, 'lando.globalDir', path.join(system.home, '.lando', 'global-plugins'));
    const userDir = get(result, 'lando.userDir', path.join(system.home, '.lando', 'plugins'));
    const data = {
      core: {
        landofile: get(result, 'app.landofile', '.lando'),
        landofiles: get(result, 'app.landofiles', ['base', 'dist', 'recipe', 'upstream', '', 'local', 'user']),
      },
      plugin: {
        'global-dir': globalDir,
        'global-manifest': path.join(system.dataDir, 'global-plugins.json'),
        'user-dir': userDir,
      },
    };

    // rebase lando config data on managed store
    hyperdrive.config.save(data);
    hyperdrive.config.defaults(data);
  }

  // add the lando config
  if (fs.existsSync(system.landoConfig)) {
    hyperdrive.lando = require(system.landoConfig)[bin].lando;
  }
};
