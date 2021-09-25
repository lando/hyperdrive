// @TODOS:
/*
  * * create metadata to handle the below
  * * revisit config loading to handle metadata above (ministrapper -> configurator)
  * * stub out all our needed commands, methods, installers, etc
  * * revisit get help, we need a help class that can delegate help and print other things eg list of available installers
  * * stub out hyperdrive library?
  * * move configurator into its own thing, move oclif helpers in their own thing?
  * * Do we want other helper methods on LandoOclifPlugin eg replaceCommand?
  */

const createDebugger = require('./../../utils/debug');
const path = require('path');

module.exports = async({id, argv, config}) => {
  let debug = createDebugger(config.dirname, 'hooks', 'init');
  // Below is mostly just to DEBUG confirm we can get this far
  debug('cli init start with id=%s, argv=%O', id, argv);

  // @TODO: eventually we will want to grab a cached config file that was the result of a previous bootstrap.
  // for speed purposes we want to minimize the time it takes to show the list of commands or help and put all
  // time instensive dep loading after the command has been run().
  // @NOTE that the config file should likely be in a hashmap where landoAppRoot -> someconfigfile because a Landofile
  // may contain plugins that hyperdrive needs to install for that lando app or it may contain some config overrides
  // eg maybe a given lando app wants to set a default plugin install method or provides a new installer/command
  // within itself
  // @TODO: this also implies we have a way to delete the cache, it would be cool if we could target that deletion
  // for specific things so that clearing the cache for app A does not blow away the cache for app B

  // Pseudo code of how this shoud generally work
  // const config = (cachedConfigFileExists) ? new Configurator(loadConfigFile) : new Configurator();
  // // get the bootsrap module and then run it
  // const bootstrapper = config.get('boostrap:module');
  // await bootstrap(config);

  // The default bootstrap module should (this assumes hyperdrive should look in lando plugins for stuff, which given the blow complexity here
  // might not be the best thing(?)
  // 1. assemble the main hyperdrive global config from various sources in priority order
  //    env, user config file, source config file, defaults
  // 2. asemble the "landofile" if one is detected and merge in global config that is specified there
  //    @NOTE: there is some "global config" that the landofile likely should not be able to alter such as bootstrap config?
  //    example: we need to know the name of the landofiles before we try to load them
  // 3. build a plugin and component registry from various sources, unless specified in the config the "first" component should
  //    serve as the default, we also probably need to scan lando plugin sources for stuff
  //    the priority order here that makes the most sense is
  //    1. plugins inside a lando app
  //    2. plugins inside a namespaced lando plugin dir, eventually we might end up with dataDir/plugins/ME, dataDir/plugins/TEAM2
  //    3. plugins inside a "global" lando directory
  //    4. plugins inside a "global" hyperdrive plugin directory
  //    5. external plugins required directly by hyperdrive and specfiied in config.plugins
  //    6. core "internal" plugins that are just part of hyperdrive, currently not sure what these would be but we should
  //       answer the question "what does hyperdrive do without any plugins?"
  //       i *think* the answer to that should be that it just installs plugins via yarn/node?
  // 4. dump the results of 1/2/3 into a cache that can be retrieved using the path of the landofile if it exists or 'global'
  //    if it does not. the cached result should also include some key that the bootsrapper can recognize so it doesnt rebuild
  //    all this stuff
  // 5. the bootstrapper should skip 1-4 if its instantiated with a cached config
  // 6. the bootstrapper should perform relevant command replacemet like we do below
  // 7. The core oclif config should be augmented with the bootstrap config so it is available to instantiate a
  //    hyperdrive from inside of a commands run()
  // 8. other considerations:
  //    * do we want to add other oclif hooks here and elsewhere? seems useful but not sure the use cases? does this imply we have
  //      some sort of way to programmatically load oclif plugins? if not hard it might be useful to allow this to empower people
  //      to create things.

  // an alternative and simpler bootstrap would be to basically ignore any lando plugins or considerations, in that model
  // 1. assemble the main hyperdrive global config from various sources in priority order
  //    env, user config file, source config file, defaults
  // 2. ignore landofile stuff (only load it up in hyperdrive install/add) with no plugin arg so we can install plugins
  // 3. build a plugin and component registry but only use:
  //    1. global hyperdrive plugin directory (hyperdrive plugins shuold be installed with hyperdrive add plugin --hyperdrive)
  //    2. external plugins required directly by hyperdrive and specfiied in config.plugins
  //    3. core "internal" plugins that are just part of hyperdrive
  // 4. dump the results of above into a single cached config file
  // 5. the bootstrapper should skip 1-4 if its instantiated with a cached config
  // 6. the bootstrapper should perform relevant command replacemet like we do below
  // 7. The core oclif config should be augmented with the bootstrap config so it is available to instantiate a
  //    hyperdrive from inside of a commands run()
  // 8. hypedrive.config.plugins should load oclif plugins? how does this work, plugin.oclifPlugin = true? or include things like
  //    installers in the oclif package.json shit?
  // 9. definitely want to make use of more hooks in this scenario:
  //    pre-bootstrap, post-bootstrap?

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
