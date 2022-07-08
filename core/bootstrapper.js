const debug = require('debug')('bootstrap:@lando/hyperdrive');
const fs = require('fs');
const mkdirp = require('mkdirp');
const nconf = require('nconf');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

// add custom yaml format
nconf.formats.yaml = require('nconf-yaml')

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
  #readFile(file) {
    switch (path.extname(file)) {
      case '.yaml':
      case '.yml':
        return yaml.load(fs.readFileSync(file, 'utf8'));
      case '.json':
        return require(file);
    }
  }

  // check to see if YAML or JSON
  #writeFile(data, file) {
    switch (path.extname(file)) {
      case '.yaml':
        return fs.writeFileSync(file, yaml.dump(data));
      case '.yml':
        return fs.writeFileSync(file, yaml.dump(data));
      case '.json':
        return fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
  }

  // do setup and validation
  // basically do what you have to do to make sure run() will complete succesfully
  async init() {
    // ensure dest directory exists
    mkdirp.sync(path.dirname(this.dest));

    // run through sources and create their directories
    // @NOTE: we dont do this on templates.dest because we assume template destinations will be sources
    // otherwise what is the point?
    for (const key of Object.keys(this.sources)) {
      if (this.sources[key]) {
        mkdirp.sync(path.dirname(this.sources[key]));
        debug('ensured directory %s exists', path.dirname(this.sources[key]));
      }
    }

    // move templates over if we need to
    for (const template in this.templates) {
      const source = this.templates[template].source;
      const dest = this.templates[template].dest;

      // if destination already exists then bail
      if (fs.existsSync(dest)) continue;

      // if we get here then we are generating a config file from a template
      debug('generating %s from template %s', dest, source);

      // copy source to destination if they are the same format
      if (this.#getFormat(source) === this.#getFormat(dest)) {
        try {
          fs.copyFileSync(source, dest);
        } catch (error) {
          throw new Error(error);
        }

      // or read/write from correct input format to correct output format
      } else {
        try {
          const data = this.#readFile(source);
          this.#writeFile(data, dest);
        } catch (error) {
          throw new Error(error);
        }
      }

      // finish
      debug('generated user config file to %s', dest);
    }
  }


  async run() {
    // if we have a CLI provided config source then assert its dominance
    if (this.sources.overrides) nconf.overrides(this.#readFile(this.sources.overrides));

    // environment is next in line
    // @TODO: make separator configuration
    const separator = '_';
    const rootKey = `${this.env}${separator}`;
    nconf.env({
      separator,
      lowerCase: true,
      parseValues: true,
      transform: obj => {
        if (obj.key.startsWith(rootKey.toLowerCase())) {
          obj.key = obj.key.replace(rootKey.toLowerCase(), '');
          return obj;
        }
      },
    });

    // load additional file sources that exist, skip overrides and defaults since those
    // are handled elsewhere
    for (const source of Object.keys(this.sources).reverse()) {
      if (source !== 'overrides' && source !== 'defaults' && this.sources[source]) {
        nconf.file(source, {
          file: this.sources[source],
          format: this.#getFormat(this.sources[source]) === 'yaml' ? nconf.formats.yaml : nconf.formats.json,
        });
      }
    }

    // finally set some defaults
    if (this.sources.defaults) nconf.defaults(this.#readFile(this.sources.defaults));

    // Return the config
    return ncong.get();
  }
}

module.exports = Bootstrapper;
