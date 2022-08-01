const os = require('os');
const path = require('path');
const which = require('which');

module.exports = ({options}) => {
  // get oclicf things we need
  const {id, oclif} = options;
  const {arch, bin, cacheDir, configDir, dataDir,  errlog, home, platform, root, shell, version, windows, userAgent} = oclif;

  // get other stuff
  const user = os.userInfo();
  const landoBin = which.sync('lando', {nothrow: true});

  // return the system config
  return {
    core: {
      app: 'minapp',
      autoSync: false,
      debugspace: id || 'hyperdrive',
      debug: false,
      engine: 'docker-desktop',
      id: id || 'hyperdrive',
      lando: 'lando-cli',
      product: id || 'hyperdrive',
      releaseChannel: 'stable',
      telemetry: true,
    },
    landoCli: {
      bin: landoBin,
      configCommand: `${landoBin} --${id}`,
      name: 'lando',
      // @TODO: need to bump this once we release a lando with `lando --hyperdrive`
      install: '3.6.5',
      // # @TODO: need to bump this once we release a lando with `lando --hyperdrive`
      required: '>=3.6.5',
    },
    plugins: {},
    registry: {
      app: {
        minapp: path.resolve(root, 'core/minapp'),
      },
      engine: {
        dockerColima: path.resolve(root, 'core/docker-colima'),
        dockerDesktop: path.resolve(root, 'core/docker-desktop'),
        dockerEngine: path.resolve(root, 'core/docker-engine'),
      },
      lando: {
        landoCli: path.resolve(root, 'core/lando-cli'),
      },
    },
    system: {
      arch,
      bin,
      cacheDir,
      configDir,
      dataDir,
      env: Object.hasOwn(process, 'pkg') ? 'prod' : 'dev',
      errlog,
      gid: user.gid,
      home,
      leia: Object.hasOwn(process.env, 'LEIA_PARSER_RUNNING'),
      mode: 'cli',
      landoConfig: path.join(cacheDir, 'lando.json'),
      packaged: Object.hasOwn(process, 'pkg'),
      platform,
      root,
      shell: which.sync(shell, {nothrow: true}),
      version,
      windows,
      uid: user.uid,
      user: user.username,
      userAgent,
    },
    updates: {
      notify: true,
    },
    'docker-desktop': {
      'required-version': '>=3.6.5 && <=5.0.0',
      'supported-version': '>=3.6.5 && <=4.10.5',
    },
    // Allows you to pass env value to Docker, Docker Compose, etc.
    env: {},
  };
};
