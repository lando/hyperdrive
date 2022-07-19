const groupBy = require('lodash/groupBy');
const orderBy = require('lodash/orderBy');

/*
 * Sorts through a list of plugins and sorts them based on given weights
 */
module.exports = (plugins, weights = {}) => {
  // add weights to the plugins
  const weightedPlugins = plugins.map(plugin => ({...plugin, weight: weights[plugin.type]}));
  // group the plugins
  const groupedPlugins = groupBy(weightedPlugins, 'name');
  // loop plugins to order them correctly
  for (const name in groupedPlugins) {
    if (groupedPlugins[name]) {
      groupedPlugins[name] = orderBy(groupedPlugins[name], ['weight'], ['asc']);
    }
  }

  // return
  return groupedPlugins;
};
