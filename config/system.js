const os = require('os');
const path = require('path');
const which = require('which');
const getContext = require('./../utils/get-context');

module.exports = ({options}) => {
  // get oclicf things we need
  const {id, oclif} = options;
  const {arch, bin, cacheDir, configDir, dataDir,  errlog, home, platform, root, shell, version, windows, userAgent} = oclif;

  // get other stuff
  const user = os.userInfo();
  const landoBin = which.sync('lando', {nothrow: true}) || 'lando';
  const context = getContext();

  // return the system config
  return {
    core: {
      app: 'app',
      autoSync: false,
      debugspace: id || path.basename(process.argv[1]) || 'hyperdrive',
      debug: false,
      engine: context === 'local' ? 'docker-desktop' : 'docker-engine',
      lando: 'lando-cli',
      pluginInstaller: 'docker-npm',
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
    plugin: {},
    registry: {
      app: {
        app: path.resolve(root, 'components/app'),
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
      pluginInstaller: {
        dockerNpm: path.resolve(root, 'components/docker-npm'),
      },
    },
    system: {
      arch,
      bin,
      cacheDir,
      configDir,
      context: context,
      dataDir,
      env: Object.hasOwn(process, 'pkg') ? 'prod' : 'dev',
      errlog,
      gid: user.gid,
      home,
      id: id || 'hyperdrive',
      interface: 'cli',
      leia: Object.hasOwn(process.env, 'LEIA_PARSER_RUNNING'),
      landoConfig: path.join(cacheDir, 'lando.json'),
      packaged: Object.hasOwn(process, 'pkg'),
      platform,
      product: id || 'hyperdrive',
      root,
      server: 'node',
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
      // npmrc: '//npm.pkg.github.com/:_authToken=GH_ACCESS_TOKEN\n@namespace:registry=https://npm.pkg.github.com',
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
