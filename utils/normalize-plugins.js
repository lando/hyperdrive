/*
 * Takes an object or array of plugins and standarizes them for strcuture and content
 */
module.exports = plugins => {
  // if its an array then map to an object
  if (Array.isArray(plugins)) {
    return Object.fromEntries(plugins.map(plugin => ([plugin.name, plugin])));
  }

  // @TODO: should we standarize the result?
  // @TODO: what about an object?
  // @TODO: other conditions?
  return plugins;
};
