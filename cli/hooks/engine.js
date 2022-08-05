// const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:prerun');

module.exports = async({Command, config}) => {
  // get stuff we need
  // @TODO: what about command aliases?
  const {id} = Command;
  const {bootstrap} = config;

  // Add the engine as a global thing if we need it
  if (id === 'add') {
    const Plugin = bootstrap.getClass('plugin');
    const engine = await bootstrap.getComponent('core.engine');
    Plugin.setEngine(engine);
  }
};
