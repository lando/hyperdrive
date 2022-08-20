const fs = require('fs');
const get = require('lodash/get');
const nconf = require('nconf');
const merge = require('lodash/merge');
const path = require('path');
const set = require('lodash/set');
const yaml = require('js-yaml');

// add custom formats
nconf.formats.yaml = require('nconf-yaml');

class Config extends nconf.Provider {
  static keys(data, {prefix = '', expandArrays = true} = {}) {
    return require('./../utils/get-object-keys')(data, {prefix, expandArrays});
  }

  constructor(options = {}) {
    // get parent stuff
    super();
    // get the id first since we need this for downstream things
    this.id = options.id || options.product || path.basename(process.argv[1]);
    // properties
    this.managed = options.managed || 'managed';
    // namespaces utils
    this.debug = require('debug')(`${this.id}:@lando/core:config`);
    // keep options around
    this.options = options;
    // Then run our own init
    this.#init(options);
  }

  // internal to get the whole thing
  // we have to do this for various reasons
  //
  // see:
  // https://github.com/indexzero/nconf/issues/300
  // https://github.com/indexzero/nconf/issues/120
  // https://github.com/indexzero/nconf/issues/315
  #get() {
    const data = merge({}, ...Object.keys(this.stores).reverse().map(store => this.stores[store].store));
    delete data.type;
    delete data.logicalSeparator;
    delete data.parseValues;
    return data;
  }

  // check to see if YAML or JSON
  #getFormat(file) {
    if (!file) return null;
    switch (path.extname(file)) {
    case '.yaml':
      return 'yaml';
    case '.yml':
      return 'yaml';
    case '.js':
      return 'js';
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
    case '.js':
      return (typeof require(file) === 'function') ? require(file)(this) : require(file);
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
  // @TODO: reduce complexity?
  #init(options) {
    this.debug('initializing config');
    const cached = options.cached || false;
    const env = options.env || this.id.toUpperCase();
    const sources = options.sources || {};
    const templates = options.templates || {};

    // run through sources and create their directories
    // @NOTE: we dont do this on templates.dest because we assume template destinations will be sources
    // otherwise what is the point?
    for (const [source, file] of Object.entries(sources)) {
      if (file && !fs.existsSync(path.dirname(file))) {
        fs.mkdirSync(path.dirname(file), {recursive: true});
        this.debug('ensured %o directory %o exists', source, path.dirname(file));
      }
    }

    // move templates over if we need to
    for (const [store, options] of Object.entries(templates)) {
      // if destination already exists and we arent replacing then bail
      if (fs.existsSync(options.dest) && !options.replace) continue;

      // copy source to destination if they are the same format
      if (this.#getFormat(options.source) === this.#getFormat(options.dest)) {
        try {
          fs.copyFileSync(options.source, options.dest);
        } catch (error) {
          throw new Error(error);
        }

      // or read/write from correct input format to correct output format
      } else {
        const data = options.source ? this.#readFile(options.source) : options.data;
        this.#writeFile(this.encode(data), options.dest);
      }

      // if we get here then we are generating a config file from a template
      this.debug('generated %o file %o from template %o', store, options.dest, options.source || options.data);
    }

    // if we have a CLI provided config source then assert its dominance
    if (sources.overrides) {
      super.overrides(this.#readFile(sources.overrides));
      this.debug('loaded config override file %s', sources.overrides);
    }

    // environment is next in line
    // @TODO: make separator configuration?
    if (env) {
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
      this.debug('loaded config from %o env namespace', rootKey);
    }

    // load additional file sources that exist, skip overrides and defaults since those
    // are handled elsewhere
    for (const [source, file] of Object.entries(sources).reverse()) {
      if (source !== 'overrides' && source !== 'defaults' && file) {
        super.file(source, {file, format: nconf.formats[this.#getFormat(file)]});
        this.debug('loaded %s config from %o', source, file);
      }
    }

    // set some defaults
    if (sources.defaults) {
      super.defaults(this.#readFile(sources.defaults));
      this.debug('loaded %o default config from %o', sources.defaults);
    }

    // add a "cached" source if possible and save the compiled result there
    // @NOTE: this isnt actually loaded into the config tree its
    // ensure dest directory exists
    if (cached) {
      fs.mkdirSync(path.dirname(cached), {recursive: true});
      // this.#writeFile(super.get(), cached);
      this.debug('dumped compiled and cached config file to %o', cached);
    }

    // The YAML spec returns null for an empty yaml document but for merging purposes we want this to be an empty
    // object so lets transform that here
    if (this.stores.user && this.stores.user.store === null) this.stores.user.store = {};
  }

  add(name, options, usage) {
    return super.add(name, {logicalSeparator: '.', parseValues: true, ...options}, usage);
  }

  // this.#decode
  decode(data) {
    return require('camelcase-keys')(data, {deep: true});
  }

  // this.#encode
  encode(data) {
    // transform to array if string
    if (typeof data === 'string') data = [data];

    // if array then map and return
    if (Array.isArray(data)) {
      return data.map(prop => prop.split('.').map(part => require('lodash/kebabCase')(part)).join('.'));
    }

    // else assume object and return
    return require('kebabcase-keys')(data, {deep: true});
  }

  // overridden get method for easier deep path selection and key-case handling
  getUncoded(path, data = {}) {
    // log the actions
    this.debug('getting %o from %o config with', path || 'everything', this.id);

    // if we are looking for a path to the default store
    if (typeof path === 'string' && path.split(':').length === 1) {
      data = get(this.#get(), path);

    // if we are looking for a path to another store
    } else if (typeof path === 'string' && path.split(':').length >= 2) {
      const store = path.split(':')[0];
      path = path.split(':')[1];
      data = path ? get(this.stores[store].store, path) : this.stores[store].store;

    // otherwise just get it all
    } else {
      data = this.#get();
    }

    // finish
    return data;
  }

  // returns the resulting object with camelcase keys
  get(path) {
    return this.decode(this.getUncoded(path));
  }

  // overriden save method
  save(data, store = this.managed) {
    // purposefully try to type parse things
    // NOTE: is this a good idea?
    for (const key of Config.keys(data)) {
      if (get(data, key)) {
        // booleans
        if (get(data, key) === 'true' || get(data, key) === '1') set(data, key, true);
        if (get(data, key) === 'false' || get(data, key) === '0') set(data, key, false);
        // arrays of strings
        if (Array.isArray(this.get(key)) && typeof get(data, key) === 'string') {
          set(data, key, get(data, key).split(/, |[ ,|]/));
        }
      }
    }

    // write the new file
    const dest = this.stores[store].file;
    this.stores[store].store = merge({}, this.stores[store].store, this.encode(data));
    this.#writeFile(this.stores[store].store, dest);
    this.debug('saved %o to %o', data, dest);
  }
}

module.exports = Config;
