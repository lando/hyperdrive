const {Command, Plugin} = require('@oclif/config');

class LandoOclifPlugin extends Plugin {
  // Replaces the command with id === cmdId with command file at path
  // @NOTE: do we need cmd.pluginName/cmd.pluginType?
  replaceCommand(cmdId, path) {
    // Build a command we can inject
    const cmd = require(path);
    cmd.id = cmdId;
    cmd.load = () => cmd;

    // Reset the needed things
    this.commands[this.commands.findIndex(({id}) => id === cmdId)] = cmd;
    this.manifest.commands[cmdId] = Command.toCached(cmd);
    this._debug('replaced %s command with file at %s', cmdId, path);
  }

  // Removes the command with id === cmdId
  // @TODO: this should handle a string id or an array of ids to be removed
  removeCommand(cmdId) {
    const commandIndex = this.commands.findIndex(({id}) => id === cmdId);
    if (commandIndex === -1) {
      this._debug('could not find a command called %s in plugin %s, doing nothing', cmdId, this.name);
      return this.commands;
    }
    this.commands.splice(commandIndex, 1);
    delete this.commands.manifest[cmdId];
    this._debug('removed command %s: plugin now has commands %o', cmdId, this.commands.map(command => command.id));
    return this.commands;
  }
}

module.exports = LandoOclifPlugin;
