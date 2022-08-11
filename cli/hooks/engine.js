// const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:prerun');

module.exports = async({Command, config}) => {
  // get stuff we need
  // @TODO: what about command aliases?
  const {id} = Command;
  const {hyperdrive} = config;

  // Add the engine as a global thing if we need it
  // @TODO: add more commands here?
  // @TODO: does this make sense to do here?
  if (id === 'add') {
    const Plugin = hyperdrive.getClass('plugin');
    const engine = await hyperdrive.getComponent('core.engine');
    Plugin.setEngine(engine);
  }
};
