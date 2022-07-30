
// const os = require('os');
const path = require('path');
// const which = require('which');

module.exports = ({options}) => {
  const {id, oclif} = options;

  /*
  user
  uid
  gid
  userAgent: '@lando/hyperdrive/0.7.0-alpha.4 darwin-arm64 node-v16.15.0',
  shell: 'zsh',
  home: '/Users/pirog',
  arch: 'arm64',
  platform: 'darwin',
  windows: false,
  bin: 'hyperdrive',
  dirname: 'hyperdrive',
  cacheDir: '/Users/pirog/Library/Caches/hyperdrive',
  configDir: '/Users/pirog/.config/hyperdrive',
  dataDir: '/Users/pirog/.local/share/hyperdrive',
  errlog: '/Users/pirog/Library/Caches/hyperdrive/error.log',
  */

  return {
    core: {
      app: 'minapp',
      debugspace: id || 'hyperdrive',
      debug: false,
      engine: 'docker-desktop',
      id: id || 'hyperdrive',
      lando: 'lando-cli',
      product: id || 'hyperdrive',
      releaseChannel: 'stable',
      root: oclif.root || path.resolve(__dirname, '..'),
      telemetry: true,
    },
    updates: {
      notify: true,
    },
  };
};
