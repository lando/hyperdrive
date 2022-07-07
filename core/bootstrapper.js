const debug = require('debug')('bootstrap:@lando/hyperdrive');
const fs = require('fs');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

class Bootstrapper {
  constructor(options) {
    // get the product first since we need this for downstream things
    this.product = options.product || path.basename(process.argv[1]);

    // properties
    this.dest = options.dest || path.join(path.join(os.homedir(), `.${this.product}`), 'cache', 'config.json');
    this.env = options.env || this.product.toUpperCase();
    this.sources = options.sources || {};
    this.templates = options.templates || {};
  }

  // check to see if YAML or JSON
  #getFormat(file) {
    switch (path.extname(file)) {
      case '.yaml':
        return 'yaml';
      case '.yml':
        return 'yaml';
      case '.json':
        return 'json';
    }
  }

  // check to see if YAML or JSON
  #read(file) {
    switch (path.extname(file)) {
      case '.yaml':
        return 'yaml';
      case '.yml':
        return 'yaml';
      case '.json':
        return 'json';
    }
  }

  // check to see if YAML or JSON
  #dump(data, file) {
    switch (path.extname(file)) {
      case '.yaml':
        return 'yaml';
      case '.yml':
        return 'yaml';
      case '.json':
        return 'json';
    }
  }

  // do setup and validation
  // basically do what you have to do to make sure run() will complete succesfully
  async init() {
    // move templates over if we need to
    for (const template in this.templates) {
      const source = this.templates[template].source;
      const dest = this.templates[template].dest;

      // if destination already exists then bail
      // @TODO: uncomment when we are done dev
      // if (fs.existsSync(dest)) continue;

      // or copy source to destination if they are the same format
      // console.log(this.#getFormat(source), this.#getFormat(dest))
      // or read in source and write to destination if source and destionation are different formats

      // console.log(source, dest);
    }
    // throw Error('seg')
  }


  async run() {
    // ensure all source directories exist?
    // const mkdirp = require('mkdirp');
    // for (const dir of [config.cacheDir, config.dataDir, config.configDir]) {
    //   mkdirp.sync(dir);
    // }
    // process.exit()


    // move templates over?
      // handle different formats?

    //



    // if we dont have a system config file then create one with the defaults
    // @TODO: put guard back once this is working properly?
    // if (!fs.existsSync(this.sources.system) || true) {
    //   debug('could not find system config file!');
    //   try {
    //     fs.writeFileSync(this.sources.system, JSON.stringify(this.defaults, null, 2));
    //     debug('generated system config file to %s', this.sources.system);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    // // if we dont have a user config file then copy the template over
    // // @TODO: put guard back once this is working properly?
    // if (!fs.existsSync(this.sources.user) || true) {
    //   debug('could not find user config file!');
    //   try {
    //     fs.copyFileSync(this.template, this.sources.user);
    //     debug('generated user config file to %s', this.sources.user);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    // build out the config and return it

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
