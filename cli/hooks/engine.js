// const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:prerun');

module.exports = async({Command, config}) => {
  // get stuff we need
  // @TODO: what about command aliases?
  const {app, hyperdrive} = config;

  // make sure the engine is set correct across contexts
  if (Array.isArray(Command.deps) && Command.deps.includes('core.engine')) {
    const engine = await hyperdrive.getComponent('core.engine');
    hyperdrive.setEngine(engine);

    // if we have an app then also set its engine
    if (app) {
      const appEngine = app.config.get('core.engine') === hyperdrive.config.get('core.engine') ? engine : await app.getComponent('core.engine');
      app.setEngine(appEngine);
    }

    // @TODO: what about ensuring installation?
  }
};
