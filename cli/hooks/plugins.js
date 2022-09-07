const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-plugins-pre');
const fs = require('fs');
const get = require('lodash/get');
const has = require('lodash/has');
const hasher = require('hash-sum');
const path = require('path');

module.exports = async({config}) => {
  // get hdrive
  const {hyperdrive} = config;
  // get some config we need
  const {plugin} = hyperdrive.config.get();
  // helper to return plugin information
  const getPlugins = (dirs = [], type = 'global') => {
    const Plugin = hyperdrive.Plugin;
    return dirs
    .filter(dir => dir.type === type)
    .map(dir => ({type: dir.type, dirs: hyperdrive.bootstrap.findPlugins(dir.dir, dir.depth)}))
    .map(dirs => dirs.dirs.map(dir => new Plugin(dir, {type: dirs.type})))
    .flat(Number.POSITIVE_INFINITY)
    .map(plugin => plugin.getStripped());
  };

  // do a quick hash comparison to see if we need to regenerate the global manifest file
  // NOTE: is this stupid to do? do we really save time here?
  if (fs.existsSync(plugin.globalManifest)) {
    const cached = require(plugin.globalManifest).map(plugin => plugin.location);
    const actual = get(hyperdrive, 'lando.pluginDirs', [])
    .filter(dir => dir.type === 'global')
    .map(dir => ({type: dir.type, dirs: hyperdrive.bootstrap.findPlugins(dir.dir, dir.depth)}))
    .flat(Number.POSITIVE_INFINITY)
    .map(plugins => plugins.dirs)
    .flat(Number.POSITIVE_INFINITY);

    // if there is a hash mismatch then remove global manifest and bust require cache
    if (hasher(cached) !== hasher(actual)) {
      debug('global plugin manifest %o seems out of sync, bustin it 2 regen it', plugin.globalManifest);
      fs.unlinkSync(plugin.globalManifest);
      delete require.cache[require.resolve(plugin.globalManifest)];
    }
  }

  // if we dont have a global plugin manifest then create it
  if (!fs.existsSync(plugin.globalManifest) && has(hyperdrive, 'lando.pluginDirs')) {
    debug('no global plugin manifest at %o looking for plugins in %o', plugin.globalManifest, hyperdrive.lando.pluginDirs);
    // look for global plugins
    const globalPlugins = getPlugins(get(hyperdrive, 'lando.pluginDirs', []), 'global');
    // do the dump
    fs.mkdirSync(path.dirname(plugin.globalManifest), {recursive: true});
    fs.writeFileSync(plugin.globalManifest, JSON.stringify(globalPlugins, null, 2));
  }

  // get our global plugins
  const globalPlugins = fs.existsSync(plugin.globalManifest) ? require(plugin.globalManifest) : [];
  debug('discovered %o global %o plugins', globalPlugins.length, get(hyperdrive, 'lando.product', 'lando'));
  hyperdrive.plugins.add('global', {type: 'literal', store: hyperdrive.bootstrap.normalizePlugins(globalPlugins)});

  // then see if we have any core plugins
  const corePlugins = get(hyperdrive, 'lando.plugins', []);
  debug('discovered %o core %o plugins', corePlugins.length, get(hyperdrive, 'lando.product', 'lando'));
  hyperdrive.plugins.add('core', {type: 'literal', store: hyperdrive.bootstrap.normalizePlugins(corePlugins)});
};
