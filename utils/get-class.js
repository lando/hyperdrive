/*
 * TBD
 */
module.exports = (component, config, registry = {}, {cache = true, configDefaults} = {}) => {
  // throw error if config is not a Config class
  if (!config.constructor || config.constructor.name !== 'Config') {
    throw new Error('getClass requires config be a Config class');
  }

  // setup debugger
  // @TODO figure app namespace out?
  const id = config.get('system.id') || 'lando';
  const debug = require('debug')(`${id}:@lando/utils:get-class`);

  // first provide some nice handling around "core" components
  // this lets you do stuff like getClass('core.engine') and get whatever that is set to
  if (component.split('.')[0] === 'core' && component.split('.').length === 2) {
    component = [component.split('.')[1], config.get(component)].join('.');
  }

  // if class is already loaded in registry and cache is true then just return the class
  if (registry[component] && cache) {
    debug('getting %o from component registry', component);
    return registry[component];
  }

  // otherwise load the component from the config
  const loader = require(config.get(`registry.${component}`));
  const isDynamic = loader.extends && typeof loader.getClass === 'function';

  // if component is "dynamically extended" then use that first
  // we use this instead of the usual class extension when the components parent is not static and is not known until
  // the configuration has been compiled. an example would be the docker-npm plugin-installer component which extends
  // whatever core.engine is
  //
  // otherwise assume the loader is the class itself
  const Component = isDynamic ? loader.getClass(module.exports(loader.extends, config, registry, {cache, configDefaults})) : loader;

  // and set its defaults if applicable
  const namespace = Component.cspace || Component.name || component.split('.')[component.split('.').length - 1];
  Component.config = configDefaults || {
    ...config.get('system'),
    ...config.get('core'),
    ...config.get(namespace),
  };

  // and set in cache if applicable
  if (cache) {
    debug('adding component %o into %o registry', component, id);
    registry[component] = Component;
  }

  // and return
  return Component;
};
