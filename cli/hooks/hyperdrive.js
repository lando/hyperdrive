const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:config');
const path = require('path');

const Config = require('./../../core/config');

module.exports = async({config}) => {
  debug('config event works!');

  // setup the lando config and add it to the command config
  const landoConfigFile = path.join(config.cacheDir, 'lando.json');
  config.lando = new Config({env: 'LANDO', id: 'lando', sources: {lando: landoConfigFile}});

  // lets make sure we know the landofile name
  const [LandoCLI, landoCLIConfig] = config.bootstrap.getComponent('core.lando');
  if (!config.lando.get(`${landoCLIConfig.bin}.app.landofile`, false)) {
    const landoCLI = new LandoCLI(landoCLIConfig); // eslint-disable-line no-unused-vars
    config.lando.use('file', {file: landoConfigFile});
  }

  // get the lando file
  const landofile = config.lando.get(`${landoCLIConfig.bin}.app.landofile`, false);
  // try to discover if we have app context or not
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const appFile = config.bootstrap.findApp(landofiles, process.cwd());

  // if we have an file then lets set it in the config for downstream purposes
  if (appFile) {
    config.appFile = appFile;
    debug('detected app file at', config.appFile);
  }
};
