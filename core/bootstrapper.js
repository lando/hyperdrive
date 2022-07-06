const debug = require('debug')('bootstrap:@lando/hyperdrive');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class Bootstrapper {
  constructor({id, argv, config}) {
    // ensure directories exist
    const mkdirp = require('mkdirp');
    for (const dir of [config.cacheDir, config.dataDir, config.configDir]) {
      mkdirp.sync(dir);
    }

    // we need to hijack options here because --config has to be used before OCLIF
    // can do its own arg parsing
    //
    // @NOTE: we could also do this inside each commands run() which would be more performant since we
    // wouldnt need minimist
    // but because doing it here is

    // define some props
    this.cached = path.join(config.cacheDir, 'config.json'),
    this.env = 'HYPERDRIVE';
    this.sources = {
      system: path.join(config.dataDir, 'config.json'),
      user: path.join(config.configDir, 'config.yaml'),
      override: stuff
    };
    this.template = path.join(__dirname, '..', 'config.yaml');

    // load in defaults from template
    try {
      this.defaults = yaml.load(fs.readFileSync(this.template, 'utf8'));
      debug('loaded configuration defaults');
    } catch (error) {
      console.error(error);
    }
  }

  async run() {
    // if we dont have a system config file then create one with the defaults
    // @TODO: put guard back once this is working properly?
    if (!fs.existsSync(this.sources.system) || true) {
      debug('could not find system config file!');
      try {
        fs.writeFileSync(this.sources.system, JSON.stringify(this.defaults, null, 2));
        debug('generated system config file to %s', this.sources.system);
      } catch (error) {
        console.error(error);
      }
    }

    // if we dont have a user config file then copy the template over
    // @TODO: put guard back once this is working properly?
    if (!fs.existsSync(this.sources.user) || true) {
      debug('could not find user config file!');
      try {
        fs.copyFileSync(this.template, this.sources.user);
        debug('generated user config file to %s', this.sources.user);
      } catch (error) {
        console.error(error);
      }
    }

    // build out the config and return it

    console.log(this);
    return {thing: 'stuff'};

    // if global doesn't exist then create it from defaults?
    // this should not be in the cache?

    // if template file doesnt exist then over to userconf root

    // merge in config from all sources
    // @TODO: handle config arg here?

    // return config?
  }
}

module.exports = Bootstrapper;
