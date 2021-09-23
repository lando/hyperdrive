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

  // @TODO: set this based on some options (--debug?). if boolean/null should set * if string should set as if DEBUG
  //        envvar was set.
  // @NOTE: this shows all debug right now for dev purposes. see @TODO above.
  // require('debug').enable('*'); // eslint-disable-line node/no-extraneous-require
  debug('cli init start with id=%s, argv=%O', id, argv);

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
