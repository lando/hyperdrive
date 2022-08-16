const os = require('os');
const path = require('path');
const which = require('which');

module.exports = ({options}) => {
  // get oclicf things we need
  const {id, oclif} = options;
  const {arch, bin, cacheDir, configDir, dataDir,  errlog, home, platform, root, shell, version, windows, userAgent} = oclif;

  // get other stuff
  const user = os.userInfo();
  const landoBin = which.sync('lando', {nothrow: true}) || 'lando';

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
    plugin: {
      globalInstallDir: path.join(home, '.lando', 'plugins'),
    },
    registry: {
      app: {
        minapp: path.resolve(root, 'components/minapp'),
      },
      engine: {
        dockerColima: path.resolve(root, 'components/docker-colima'),
        dockerDesktop: path.resolve(root, 'components/docker-desktop'),
        dockerEngine: path.resolve(root, 'components/docker-engine'),
      },
      lando: {
        landoCli: path.resolve(root, 'components/lando-cli'),
      },
      plugin: path.resolve(root, 'components/plugin'),
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
    dockerDesktop: {
      required: '>=3.6.5 && <=5.0.0',
      scripts: path.resolve(root, 'scripts', 'docker-desktop'),
      server: {
        socketPath: (platform === 'win32') ? '//./pipe/docker_engine' : '/var/run/docker.sock',
        // host: '192.168.1.10',
        // port: process.env.DOCKER_PORT || 2375,
        // ca: fs.readFileSync('ca.pem'),
        // cert: fs.readFileSync('cert.pem'),
        // key: fs.readFileSync('key.pem'),
        // version: 'v1.25',
      },
      supported: '>=3.6.5 && <=4.10.5',
    },
    dockerEngine: {
      // required: '>=3.6.5 && <=5.0.0',
      // scripts: path.resolve(root, 'scripts', 'docker-desktop'),
      // server: {
      //   socketPath: (platform === 'win32') ? '//./pipe/docker_engine' : '/var/run/docker.sock',
      //   // host: '192.168.1.10',
      //   // port: process.env.DOCKER_PORT || 2375,
      //   // ca: fs.readFileSync('ca.pem'),
      //   // cert: fs.readFileSync('cert.pem'),
      //   // key: fs.readFileSync('key.pem'),
      //   // version: 'v1.25',
      // },
      // supported: '>=3.6.5 && <=4.10.5',
    },
    // Allows you to pass env value to Docker, Docker Compose, etc.
    // @TODO: figure out how to implement this exactly
    env: {},
  };
};
