// debug should be on this?
const fs = require('fs');
const get = require('lodash/get');
const keys = require('all-object-keys');
const mkdirp = require('mkdirp');
const nconf = require('nconf');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');

// add custom yaml format
nconf.formats.yaml = require('nconf-yaml');

class Config extends nconf.Provider {
  constructor(options) {
    // get parent stuff
    super();
    // get the id first since we need this for downstream things
    this.id = options.id || path.basename(process.argv[1]);
    // properties
    this.managed = options.managed || 'system';
    // namespaces utils
    this.debug = require('debug')(`config:${this.id}`);
    // Then run our own init
    this.#init(options);
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
    case '.yml':
      try {
        return fs.writeFileSync(file, yaml.dump(data));
      } catch (error) {
        throw new Error(error);
      }

    case '.json':
      try {
        return fs.writeFileSync(file, JSON.stringify(data, null, 2));
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  // do setup and validation
  // basically do what you have to do to make sure run() will complete succesfully
  #init(options) {
    const cached = options.cached || path.join(path.join(os.homedir(), `.${this.id}`), 'cache', 'config.json');
    const env = options.env || this.id.toUpperCase();
    const sources = options.sources || {};
    const templates = options.templates || {};

    // run through sources and create their directories
    // @NOTE: we dont do this on templates.dest because we assume template destinations will be sources
    // otherwise what is the point?
    for (const source of Object.keys(sources)) {
      if (sources[source]) {
        mkdirp.sync(path.dirname(sources[source]));
        this.debug('ensured directory %s exists', path.dirname(sources[source]));
      }
    }

    // move templates over if we need to
    for (const template in templates) {
      if (templates[template]) {
        const source = templates[template].source;
        const dest = templates[template].dest;

        // if destination already exists then bail
        if (fs.existsSync(dest)) continue;

        // if we get here then we are generating a config file from a template
        this.debug('generating %s from template %s', dest, source);

        // copy source to destination if they are the same format
        if (this.#getFormat(source) === this.#getFormat(dest)) {
          try {
            fs.copyFileSync(source, dest);
          } catch (error) {
            throw new Error(error);
          }

        // or read/write from correct input format to correct output format
        } else {
          const data = this.#readFile(source);
          this.#writeFile(data, dest);
        }

        // finish
        this.debug('generated user config file to %s', dest);
      }
    }

    // if we have a CLI provided config source then assert its dominance
    if (sources.overrides) {
      super.overrides(this.#readFile(sources.overrides));
      this.debug('loaded config override file %s', sources.overrides);
    }

    // environment is next in line
    // @TODO: make separator configuration?
    const separator = '_';
    const rootKey = `${env}${separator}`;
    super.env({
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
    this.debug('loaded config from %s env namespace', rootKey);

    // load additional file sources that exist, skip overrides and defaults since those
    // are handled elsewhere
    for (const source of Object.keys(sources).reverse()) {
      if (source !== 'overrides' && source !== 'defaults' && sources[source]) {
        super.file(source, {
          file: sources[source],
          format: this.#getFormat(sources[source]) === 'yaml' ? nconf.formats.yaml : nconf.formats.json,
        });
        this.debug('loaded %s config from %s', source, sources[source]);
      }
    }

    // set some defaults
    if (sources.defaults) {
      super.defaults(this.#readFile(sources.defaults));
      this.debug('loaded %s default config from %s', sources.defaults);
    }

    // add a "cached" source if possible and save the compiled result there
    // @NOTE: this isnt actually loaded into the config tree its
    // ensure dest directory exists
    if (cached) {
      mkdirp.sync(path.dirname(cached));
      this.#writeFile(super.get(), cached);
      super.add('cached', {type: 'file', file: cached});
      this.debug('dumped compiled and cached config file to %s', cached);
    }

    // The YAML spec returns null for an empty yaml document but for merging purposes we want this to be an empty
    // object so lets transform that here
    if (this.stores.user.store === null) this.stores.user.store = {};
  }

  // overridden get method for easier deep path selection
  get(path) {
    if (path) return get(super.get(), path);
    return super.get();
  }

  // helper to get an array of all config paths
  getPaths(store) {
    return store ? keys(this.stores[store].get()) : keys(this.get());
  }

  // overriden save method
  save(data, store = this.managed) {
    const dest = this.stores[store].file;
    this.#writeFile({...this.stores[store].get(), ...data}, dest);
    this.debug('saved %o to %s', data, dest);
  }
}

module.exports = Config;
