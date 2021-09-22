/*
 * New plugin types:
 * HyperdrivePlugin extends Config.Plugin
 * 1. accepts a list of commands and an optional selector function for a "parent"
 *
 *
*/
/*
const Config = require('@oclif/config');

class DynamicPlugin extends Config.Plugin {
  get hooks() { return {} }
  get topics() {
    return []
  }
  get commandIDs() {
    return ['mydynamiccommand']
  }

  get commands() {
    const cmd = require('../more/bye');
    cmd.id = 'bye';
    cmd.load = () => cmd;
    return [cmd];
  }
}
*/
