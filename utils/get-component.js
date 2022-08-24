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
  const instance = Array.isArray(constructor) ? new Component(...constructor) : new Component(constructor);

  // and run its init func if applicable
  if (instance.init && typeof instance.init === 'function' && init) {
    await instance.init(constructor, {config, registry, cache, defaults, init});
  }

  // and return
  return instance;
};
