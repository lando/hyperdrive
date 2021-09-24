const OclifPlugin = require('@oclif/config').Plugin;

class LandoOclifPlugin extends OclifPlugin {
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

module.exports = LandoOclifPlugin;
