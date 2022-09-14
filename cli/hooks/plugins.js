const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-plugins-pre');
const get = require('lodash/get');

module.exports = async({config}) => {
  // get hdrive
  const {hyperdrive} = config;

  // get global plugin dirs
  const globalPluginDirs = get(hyperdrive, 'lando.pluginDirs', []).filter(dir => dir.type === 'global');
  debug('looking for global plugins in %o', globalPluginDirs);

  // get our global plugins
  const globalPlugins = globalPluginDirs
  .map(dir => hyperdrive.bootstrap.findPlugins(dir.dir, dir.depth))
  .flat(Number.POSITIVE_INFINITY)
  .map(dir => ({location: dir, type: 'global'}));
  debug('discovered %o global %o plugins', globalPlugins.length, get(hyperdrive, 'lando.product', 'lando'));
  hyperdrive._plugins.add('global', {type: 'literal', store: hyperdrive.bootstrap.normalizePlugins(globalPlugins, 'location')});

  // then see if we have any core plugins
  const corePlugins = get(hyperdrive, 'lando.plugins', []);
  debug('discovered %o core %o plugins', corePlugins.length, get(hyperdrive, 'lando.product', 'lando'));
  hyperdrive._plugins.add('core', {type: 'literal', store: hyperdrive.bootstrap.normalizePlugins(corePlugins, 'location')});
};
