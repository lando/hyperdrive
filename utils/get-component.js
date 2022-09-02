/*
 * TBD
 */
module.exports = async(component, constructor, config, {cache = true, defaults, init = true, registry = {}} = {}) => {
  // get class component and instantiate
  const Component = require('./get-class')(
    component,
    config,
    registry,
    {cache, defaults},
  );

  // if component has a "dynamic extends" then do that here.
  //
  // we use this instead of the usual class extension when the components parent is not static and is not known until
  // the configuration has been compiled. an example would be the docker-npm plugin-installer component which extends
  // whatever core.engine is
  // if (Component.extends && require('./get-class')(Component.extends)) {
  //   require('util').inherits(Component, require('./get-class')(Component.extends));
  // }

  // get an instance
  const instance = Array.isArray(constructor) ? new Component(...constructor) : new Component(constructor);

  // and run its init func if applicable
  if (instance.init && typeof instance.init === 'function' && init) {
    await instance.init(constructor, {config, registry, cache, defaults, init});
  }

  // and return
  return instance;
};
