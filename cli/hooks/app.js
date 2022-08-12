// const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-app');

module.exports = async() => {
  // debug(config);
  // // get the lando file
  // const landofile = core.landofile;
  // // try to discover if we have app context or not
  // const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  // const landofilePath = hyperdrive.bootstrap.findApp(landofiles, process.cwd());

  // // if we have an file then lets set it in the config for downstream purposes
  // if (landofilePath) {
  //   // what does hyperdrive need for most downstream things?
  //   // the status of the config? app.config vs hyperdrive.config?
  //   // the list of plugins?

  //   // how does minapp loading happen?
  //   // minapp should legit just load landofiles and mix in any global things
  //   // 1. set the static props defaults = config plugins = lando plugins
  //   // 2. constructor will need to:
  //   //    a. load in initial landofile
  //   //    b. assess whether we have initial landofiles to load
  //   //    c. assemble the landofiles together in a CONFIG: TBD on relationship with global config?
  //   //    d. get the plugin info and add it to App.plugins?
  //   //    e. cache results of stuff? how is cache loading going to work for config/plugins in lando/

  //   hyperdrive.landofile = landofilePath;
  //   hyperdrive.config.set('app.landofile', hyperdrive.landofile);
  //   debug('detected a landofile file at %o', hyperdrive.landofile);
  // }
};
