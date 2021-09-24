const createDebugger = require('./../../utils/debug');
const path = require('path');

// @TODO: only load this if we need it
const LandoOclifPlugin = require('./../../utils/plugin');

module.exports = async({id, argv, config}) => {
  let debug = createDebugger(config.dirname, 'hooks', 'init');
  // Check for --debug and internally set DEBUG=* if its set
  // @TODO: we should make debug a string flag so it can work like setting DEBUG=something
  // @TODO: should we handle --debug on our own or use something lightweight like minimist?
  // @TODO: or maybe add this as a util?
  // @TODO: this should go at the top of bin/hyperdrive so we get debug output before this point
  // @TODO: we should give preference to process.env.DEBUG if its set.
  if ([id, ...argv].find(element => element === '--debug') === '--debug') {
    require('debug').enable('*'); // eslint-disable-line node/no-extraneous-require
  }
  // Below is mostly just to DEBUG confirm we can get this far
  debug('cli init start with id=%s, argv=%O', id, argv);

  // @TODOS:
  /*
   * ~~1. get debug flag~~
   * 2. plugin helper commands that to do not require lodash (find plugins)
   * 3. extended plugin class with extra methods?
   *  *  eg removeCommand, replaceCommand
   * 4. extended plugin class with ability to dynamically add commands vs from manifest file
   * 5. create metadata to handle the below
   * 6. revisit config loading to handle metadata above (ministrapper -> configurator)
   * 7. stub out all our needed commands, methods, installers, etc
   * 8. revisit get help, we need a help class that can delegate help and print other things eg list of available installers
   * 9. stub out hyperdrive library?
   * 10. move configurator into its own thing, move oclif helpers in their own thing?
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
  // @TODO: remove command should eventually be a method on LandoOclifPlugin
  const removeCommand = (plugin = {}, cmdId) => {
    const commandIndex = plugin.commands.findIndex(({id}) => id === cmdId);
    if (commandIndex === -1) {
      debug('could not find a command called %s in plugin %s, doing nothing', cmdId, plugin.name);
      return plugin.commands;
    }
    plugin.commands.splice(commandIndex, 1);
    debug('removed command %s: plugin now has commands %o', cmdId, plugin.commands.map(command => command.id).join(', '));
    return plugin.commands;
  };

  // @TODO: restantiate corePlugin as a ocliflandoplugin?

  // if id-argv matches a signature then remove id and load up queuer
  // @NOTE: should this be both add and install?
  if (id === 'install' && argv[0] === 'docker-desktop') {
    // Lets remove the add command
    const corePlugin = findPlugin(config.plugins, '@lando/hyperdrive');
    // delete corePlugin.manifest.commands.add;
    corePlugin.commands = removeCommand(corePlugin, 'install');
    // find the correct install plugin?
    const installerPlugin = findPlugin(config.installers, 'docker-desktop');
    config.plugins.push(new LandoOclifPlugin(config, {id: 'install', path: installerPlugin.path}));
  }

  // if id-argv matches a signature then remove id and load up queuer
  // @NOTE: should this be both add and install?
  if (id === 'uninstall' && argv[0] === 'docker-desktop') {
    // Lets remove the add command
    const corePlugin = findPlugin(config.plugins, '@lando/hyperdrive');
    // delete corePlugin.manifest.commands.add;
    corePlugin.commands = removeCommand(corePlugin, 'uninstall');
    // find the correct install plugin?
    const uninstallerPlugin = findPlugin(config.uninstallers, 'docker-desktop');
    config.plugins.push(new LandoOclifPlugin(config, {id: 'uninstall', path: uninstallerPlugin.path}));
  }
};
