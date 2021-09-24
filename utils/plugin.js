const OclifPlugin = require('@oclif/config').Plugin;

class LandoOclifPlugin extends OclifPlugin {
  // constructor(config) {
  //   super(config);
  //   // this.replace = replace;
  // }

  // @TODO: this should handle a string id or an array of ids to be removed
  removeCommand(cmdId) {
    // remove command logic here
    // @NOTE: this is not namespaced in a useful way until load is run

    const commandIndex = this.commands.findIndex(({id}) => id === cmdId);
    if (commandIndex === -1) {
      this._debug('could not find a command called %s in plugin %s, doing nothing', cmdId, this.name);
      return this.commands;
    }
    this.commands.splice(commandIndex, 1);
    this._debug('removed command %s: plugin now has commands %o', cmdId, this.commands.map(command => command.id));
    return this.commands;
  }

  // @TODO: we need to make sure that when we reinstantiate @lando/hyperdrive that this
  // gets the list of hooks correctly, otherwise is set to {}

  // get hooks() {
  //   return {};
  // }

  // get topics() {
  //   return [];
  // }

  // // @TODO: do we need this?
  // get commandIDs() {
  //   return [this.replace.id];
  // }

  /*
  get commands() {
    const cmd = require(this.replace.path);
    cmd.id = this.replace.id;
    cmd.load = () => cmd;
    return [cmd];
  }
  */
}

module.exports = LandoOclifPlugin;
