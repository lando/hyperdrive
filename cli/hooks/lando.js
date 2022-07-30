const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:config');
const path = require('path');

const Config = require('../../core/config');

module.exports = async({config}) => {
  debug('config event works!');

  // setup the lando config and add it to the command config
  const landoConfigFile = path.join(config.cacheDir, 'lando.json');
  config.lando = new Config({env: 'LANDO', id: 'lando', sources: {lando: landoConfigFile}});

  // get core.lando so we can check for stuff
  const [LandoCLI, landoCLIConfig] = config.bootstrap.getComponent('core.lando');

  // lets make sure we know the global plugin dir
  if (!config.hyperdrive.get('plugins.globalDir')) {
    if (!config.lando.get(`${landoCLIConfig.bin}.lando.globalPluginDir`)) {
      const landoCLI = new LandoCLI({...config.hyperdrive.get('core'), ...landoCLIConfig});
      config.lando.use('file', {file: landoConfigFile});
      debug('discovered that our global plugin dir is %o', landoCLI.globalPluginDir);
    }

    config.hyperdrive.set('plugins.global-dir', config.lando.get(`${landoCLIConfig.bin}.lando.globalPluginDir`));
  }

  // lets make sure we know the landofile name
  if (!config.lando.get(`${landoCLIConfig.bin}.app.landofile`)) {
    const landoCLI = new LandoCLI({...config.hyperdrive.get('core'), ...landoCLIConfig});
    config.lando.use('file', {file: landoConfigFile});
    debug('discovered that our landofile is called %o', landoCLI.landofile);
  }

  // get the lando file
  const landofile = config.lando.get(`${landoCLIConfig.bin}.app.landofile`, false);
  // try to discover if we have app context or not
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const landofilePath = config.bootstrap.findApp(landofiles, process.cwd());

  // if we have an file then lets set it in the config for downstream purposes
  if (landofilePath) {
    config.landofile = landofilePath;
    debug('detected a landofile file at %o', config.landofile);
  }
};
