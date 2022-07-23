module.exports = () => {
  return {
    registry: {
      engine: {
        'docker-colima': 'hyperdrive://core/docker-colima',
        'docker-desktop': 'hyperdrive://core/docker-desktop',
        'docker-engine': 'hyperdrive://core/docker-engine',
      },
      lando: {
        'lando-cli': 'hyperdrive://core/lando-cli',
      },
    },
  };
};

/*
docker-desktop:
  required-version: ">=3.6.5 && <=5.0.0"
  supported-version: ">=3.6.5 && <=4.10.5"

# @TODO: need to bump these to 3.6.6 once we release a lando with `lando hyperdrive`
lando-cli:
  bin: lando
  install-default: "3.6.5" # @TODO: need to bump this once we release a lando with `lando hyperdrive`
  # @NOTE: below uses the satisfies syntax from https://www.npmjs.com/package/semver
  required-version: ">=3.6.5" # @TODO: need to bump this once we release a lando with `lando hyperdrive`
*/
