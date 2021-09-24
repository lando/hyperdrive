const _ = require('lodash'); // eslint-disable-line node/no-unpublished-require
const createDebugger = require('../../utils/debug');
const Config = require('@oclif/config');

class DynamicPlugin extends Config.Plugin {
  constructor(config, replace) {
    super(config);
    this.replace = replace;
  }

  get hooks() {
    return {};
  }

  get topics() {
    return [];
  }

  // @TODO: do we need this?
  get commandIDs() {
    return [this.replace.id];
  }

  get commands() {
    const cmd = require(this.replace.path);
    cmd.id = this.replace.id;
    cmd.load = () => cmd;
    return [cmd];
  }
}

module.exports = async({id, argv, config}) => {
  let debug = createDebugger(config.dirname, 'hooks', 'init');
  // Check for --debug and internally set DEBUG=* if its set
  // @TODO: we should make debug a string flag so it can work like setting DEBUG=something
  // @TODO: should we handle --debug on our own or use something lightweight like minimist?
  if ([id, ...argv].find(element => element === '--debug') === '--debug') {
    require('debug').enable('*'); // eslint-disable-line node/no-extraneous-require
  }
  // Below is mostly just to DEBUG confirm we get this far
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

  // handle argv aliases
  if ((id === 'install' || id === 'uninstall') && argv[0] === 'engine') {
    argv[0] = 'docker-desktop';
  }

  // if id-argv matches a signature then remove id and load up queuer
  // @NOTE: should this be both add and install?
  if (id === 'install' && argv[0] === 'docker-desktop') {
    // Lets remove the add command
    const corePlugin = _.find(config.plugins, {name: '@lando/hyperdrive'});
    // delete corePlugin.manifest.commands.add;
    _.remove(corePlugin.commands, {id: 'add'});
    // find the correct install plugin?
    config.plugins.push(new DynamicPlugin(config, {id: 'install', path: './../commands/install-docker-desktop.js'}));
  }

  // if id-argv matches a signature then remove id and load up queuer
  // @NOTE: should this be both add and install?
  if (id === 'uninstall' && argv[0] === 'docker-desktop') {
    // Lets remove the add command
    const corePlugin = _.find(config.plugins, {name: '@lando/hyperdrive'});
    // delete corePlugin.manifest.commands.add;
    _.remove(corePlugin.commands, {id: 'remove'});
    // find the correct install plugin?
    config.plugins.push(new DynamicPlugin(config, {id: 'uninstall', path: './../commands/uninstall-docker-desktop.js'}));
  }
};
