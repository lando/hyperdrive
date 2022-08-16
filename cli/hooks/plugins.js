const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-plugins-pre');
const fs = require('fs');
const get = require('lodash/get');
const has = require('lodash/has');
const path = require('path');

module.exports = async({config}) => {
  // get hdrive
  const {hyperdrive} = config;
  // get some config we need
  const {plugin} = hyperdrive.config.get();

  // if we dont have a global plugin manifest then create it
  if (!fs.existsSync(plugin.globalManifest) && has(hyperdrive, 'lando.pluginDirs')) {
    debug('no global plugin manifest at %o looking for plugins in %o', plugin.globalManifest, hyperdrive.lando.pluginDirs);
    // look for plugins
    const Plugin = hyperdrive.getClass('plugin');
    const globalPlugins = get(hyperdrive, 'lando.pluginDirs', [])
    .filter(dir => dir.type === 'global')
    .map(dir => ({type: dir.type, dirs: hyperdrive.bootstrap.findPlugins(dir.dir, dir.depth)}))
    .map(dirs => dirs.dirs.map(dir => new Plugin({root: dir, type: dirs.type})))
    .flat(Number.POSITIVE_INFINITY)
    // @TODO: should we have some standard way to do this?
    // @TODO: is this list going to change?
    // @TODO: what about things like deprecated and hidden?
    .map(plugin => {
      const {channel, config, debug, installDir, pjson, root, updateAvailable, ...dumpable} = plugin;
      return dumpable;
    });

    // do the dump
    fs.mkdirSync(path.dirname(plugin.globalManifest), {recursive: true});
    fs.writeFileSync(plugin.globalManifest, JSON.stringify(globalPlugins, null, 2));
  }

  // get our global plugins
  // @TODO: try/catch for require?
  const globalPlugins = require(plugin.globalManifest);
  debug('discovered %o global %o plugins', globalPlugins.length, get(hyperdrive, 'lando.product', 'lando'));
  hyperdrive.plugins.add('global', {type: 'literal', store: hyperdrive.bootstrap.normalizePlugins(globalPlugins)});

  // then see if we have any core plugins
  const corePlugins = get(hyperdrive, 'lando.plugins', []);
  debug('discovered %o core %o plugins', corePlugins.length, get(hyperdrive, 'lando.product', 'lando'));
  hyperdrive.plugins.add('core', {type: 'literal', store: hyperdrive.bootstrap.normalizePlugins(corePlugins)});
};
