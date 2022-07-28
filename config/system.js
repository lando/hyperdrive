const path = require('path');
const which = require('which');

module.exports = () => {
  const root = path.resolve(__dirname, '..');
  return {
    core: {root},
    registry: {
      app: {
        minapp: path.resolve(root, 'core/minapp'),
      },
      engine: {
        'docker-colima': path.resolve(root, 'core/docker-colima'),
        'docker-desktop': path.resolve(root, 'core/docker-desktop'),
        'docker-engine': path.resolve(root, 'core/docker-engine'),
      },
      lando: {
        'lando-cli': path.resolve(root, 'core/lando-cli'),
      },
    },
    'lando-cli': {
      bin: which.sync('lando', {nothrow: true}),
      // @TODO: need to bump this once we release a lando with `lando --hyperdrive`
      install: '3.6.5',
      // # @TODO: need to bump this once we release a lando with `lando --hyperdrive`
      required: '>=3.6.5',
    },
  };
};

/*
docker-desktop:
  required-version: ">=3.6.5 && <=5.0.0"
  supported-version: ">=3.6.5 && <=4.10.5"
*/
