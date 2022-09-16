const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-app-pre');
const fs = require('fs');
const get = require('lodash/get');
const path = require('path');

module.exports = async({config}) => {
  // get some stuff we need
  const {hyperdrive} = config;
  const landofile = hyperdrive.config.get('core.landofile');

  // try to discover if we have app context or not
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const landofilePath = hyperdrive.findApp(landofiles, process.cwd());

  // if we have an file then lets set it in the config for downstream purposes
  if (fs.existsSync(landofilePath)) {
    // get a minapp
    const MinApp = hyperdrive.getClass('app.minapp');
    const app = new MinApp({landofile: landofilePath, config: hyperdrive.config.getUncoded(), plugins: hyperdrive.getPlugins()});
    app.setCorePlugins(get(hyperdrive, 'lando.plugins', []));
    // set and report
    config.app = app;
    debug('discovered an app called %o at %o', config.app.name, path.dirname(landofilePath)); // eslint-disable-line unicorn/consistent-destructuring
  }
};
