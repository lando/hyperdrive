const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:config');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const Config = require('./../../core/config');

module.exports = async({config}) => {
  debug('config event works!');

  // setup the lando config and add it to the command config
  const landoConfigFile = path.join(config.cacheDir, 'lando.json');
  config.lando = new Config({env: 'LANDO', id: 'lando', sources: {lando: landoConfigFile}});

  // lets make sure we know the landofile name
  const {Component, cc} = config.bootstrap.getComponent(`lando.${config.hyperdrive.get('core.lando')}`);
  if (!config.lando.get(`${cc.bin}.app.landofile`, false)) {
    const landoCLI = new Component(cc); // eslint-disable-line no-unused-vars
    config.lando.use('file', {file: landoConfigFile});
  }

  // get the lando file
  const landofile = config.lando.get(`${cc.bin}.app.landofile`, false);
  // try to discover if we have app context or not
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const appPath = config.bootstrap.findApp(landofiles, process.cwd());
  if (appPath) config.app = yaml.load(fs.readFileSync(appPath, 'utf8'));
};
