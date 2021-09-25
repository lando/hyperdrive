const createDebugger = require('./../../utils/debug');
const path = require('path');

module.exports = async({id, argv, config}) => {
  let debug = createDebugger(config.dirname, 'hooks', 'init');
  // Below is mostly just to DEBUG confirm we can get this far
  debug('cli init start with id=%s, argv=%O', id, argv);

  // @TODO: eventually we will want to grab a cached config file that was the result of a previous bootstrap
  // for speed purposes, we want to minimize the time it takes to show the list of commands or help and put all
  // time instensive dep loading after the command has been run().
  // @NOTE that the config file should likely be in a hashmap where landoAppRoot -> someconfigfile because a Landofile
  // may contain plugins that hyperdrive needs to install for that lando app or it may contain some config overrides
  // eg maybe a given lando app wants to set a default plugin install method or provides a new installer/command
  // within itself
  // @TODO: this also implies we have a way to delete the cache, it would be cool if we could target that deletion
  // for specific things so that clearing the cache for app A does not blow away the cache for app B

  // @TODOS:
  /*
   * ~~3. extended plugin class with extra methods?
   *  *  eg removeCommand~~
   * * extended plugin class with ability to dynamically add commands vs from manifest file
   * * create metadata to handle the below
   * * revisit config loading to handle metadata above (ministrapper -> configurator)
   * * stub out all our needed commands, methods, installers, etc
   * * revisit get help, we need a help class that can delegate help and print other things eg list of available installers
   * * stub out hyperdrive library?
   * * move configurator into its own thing, move oclif helpers in their own thing?
   * * Do we want other helper methods on LandoOclifPlugin eg replaceCommand?
   */

  // handle argv install aliases
  // @TODO: eventually this should be powered by config metadata
  // @TODO: where will that metadata go?
  if ((id === 'install' || id === 'uninstall') && argv[0] === 'engine') {
    argv[0] = 'docker-desktop';
  }

  // @TODO: Below should be loaded via Configurator when that is ready to go
  // @TODO: When a plugins manifest data is loaded it should construct an id for each component which is
  // pluginname/component so for below this would give something like hyperdrive-core/docker-desktop
  config.installers = [
    {name: 'docker-desktop', path: path.join(__dirname, '..', 'installers', 'docker-desktop.js')},
  ];
  config.uninstallers = [
    {name: 'docker-desktop', path: path.join(__dirname, '..', 'uninstallers', 'docker-desktop.js')},
  ];

  // @TODO: move findPlugin to utils/utils.js? and eventually into @lando/oclifer?
  // @TODO: eventually we should make criteria able to match by more than just name/id
  const findPlugin = (plugins = [], criteria) =>  plugins.find(({name}) => name === criteria);
  const findPluginIndex = (plugins = [], criteria) =>  plugins.findIndex(({name}) => name === criteria);

  // @TODO: We should only load our plugin class and replace the core plugin if
  // we have an id/argv combination that will require command removal and/or
  // dynamically loading commands eg hyperdrive install docker-desktop
  const needsElevation = true;
  if (needsElevation) {
    const LandoOclifPlugin = require('./../../utils/plugin');
    // Create a drop in replacement of the corePlugin using our extended plugin class and load it
    // const newCorePlugin = new LandoOclifPlugin({type: 'hyperdrive', root: config.root});
    const newCorePlugin = new LandoOclifPlugin({root: config.root, type: 'hyperdrive'});
    await newCorePlugin.load();
    // Replace core oclif plugin with our lando one
    config.plugins.splice(findPluginIndex(config.plugins, '@lando/hyperdrive'), 1, newCorePlugin);

    // if id-argv matches a signature then remove id and load up queuer
    // @NOTE: should this be both add and install?
    if (id === 'install' && argv[0] === 'docker-desktop') {
      newCorePlugin.replaceCommand('install', findPlugin(config.installers, 'docker-desktop').path);
    }

    // if id-argv matches a signature then remove id and load up queuer
    // @NOTE: should this be both remove and uninstall?
    if (id === 'uninstall' && argv[0] === 'docker-desktop') {
      newCorePlugin.replaceCommand('uninstall', findPlugin(config.uninstallers, 'docker-desktop').path);
    }
  }
};
