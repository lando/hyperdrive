const findPlugins = require('./find-plugins');
const normalizePlugins = require('./normalize-plugins');

const Config = require('../core/config');
const DefaultPlugin = require('../core/plugin');

/*
 * TBD
 */
module.exports = (sources = [], Plugin = DefaultPlugin, options = {}) => {
  // start by looping through sources and separating all the things
  for (const source of sources) {
    // make sure plugins is at least an empty array
    if (!source.plugins || !Array.isArray(source.plugins)) source.plugins = [];

    // if we have directories to scan then scan them
    if (source.dirs && Array.isArray(source.dirs)) {
      source.plugins = [...source.plugins, ...source.dirs
      .map(dir => findPlugins(dir.dir, dir.depth))
      .flat(Number.POSITIVE_INFINITY)
      .map(dir => new Plugin(dir, {type: source.store, ...options}))];
    }

    // then separate out valid and invalid plugins
    if (source.plugins && Array.isArray(source.plugins)) {
      source.invalids = source.plugins.filter(plugin => !plugin.isValid);
      source.plugins = source.plugins.filter(plugin => plugin.isValid);
    }
  }

  // stuff
  const debug = require('debug')(`${Plugin.id}:@lando/utils:get-plugins`);
  const plugins = new Config({env: false});
  const invalids = new Config({env: false});

  // do the priority resolution
  for (const source of sources) {
    // valid stuff
    if (source.plugins && source.plugins.length > 0) {
      debug('added %o plugin(s) to the %o store', source.plugins.length, source.store);
      plugins.add(source.store, {type: 'literal', store: normalizePlugins(source.plugins)});
    }

    // invalid
    if (source.invalids && source.invalids.length > 0) {
      debug('plugin(s) %o do not appear to be valid plugins, skipping', source.invalids.map(plugin => plugin.name));
      invalids.add(source.store, {type: 'literal', store: normalizePlugins(source.invalids)});
    }
  }

  // and return
  return {plugins: plugins.getUncoded(), invalids: invalids.getUncoded()};
};
