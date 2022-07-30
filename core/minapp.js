const fs = require('fs');
// const get = require('lodash/get');
const path = require('path');
const yaml = require('js-yaml');

// const Config = require('./config');

/**
 * @NOTE: the purpose of the minapp is something we can just new MinApp() without a helper async load/init function
 * it should quickly return and give us "all the things we need which is TBD" for hyperdrive that would be
 * just assembling the landofile config, plugins, etc, for lando that might also include being able to exec a command
 * @NOTE: does this min minapp lacks any ASYNC init like engine/plugin etc? what happens when the assembled config is not
 * complete eg has not gone through app init? maybe an init: false prop?
 *
 * @TODO: lots of the config loading makes sense in the constructor EXCEPT for selecting the relevant app component
 * to use, that needs to be done outside of this but how do we do that? probably in the load app util function?
 */
class MinApp {
  // private props
  #landofile
  #landofileExt
  #mainfile
   #config // the "global" config
  #options
  #plugins

  /**
   * @TODO: options? channel?
   */
  constructor(landofile, options = {}) {
    // private props
    this.#landofileExt = landofile.split('.').pop();
    this.#landofile = path.basename(landofile, `.${this.#landofileExt}`);
    this.#mainfile = yaml.load(fs.readFileSync(this.#landofile, 'utf8'));
    this.#options = options;
    // @TODO some id base64 hash of name/namespace/root? what is the default user?

    // load the main appfile
    this.root = path.dirname(this.#landofile);
    this.name = this.#mainfile.name;
    // @TODO: validate that we have at least a name?
    // @TODO: special parsing of name eg camelcase?
    // @TODO: an id filed eg base64 encodded name?
    // @TODO: any additional landofiles we should add based on what is in the main file?

    // set the debugger
    this.debug = require('debug')(`${this.name}:@lando/core:minapp`);
    // this.debug('YES')

    // build hte config config
    // const cConfig = {
    //   cached: '',
    //   // env: ? ID_APPNAME?
    //   // id: this.#name,
    // }
    // @TODO: what do defaults look like?
    // @TODO: loop through and add sources?
    // @TODO: determine various directories like where do cache stuff
    // @TODO: if cache exists do we just load that and continue? what busts the cache?

    // const landofiles = get(options, 'app.landofiles', [''])
    // .map(file => file === '' ? `${this.#landofile}.${this.#landofileExt}` : `${this.#landofile}.${file}.${this.#landofileExt}`);

    // console.log(landofiles)
    // discover additional landofiles
    // const landofile = get()

    // build list of absolute paths to look for landofiles
    // load them into Config?
    // @TODO make this a static method?

    // discover additional plugins
    // process.exit(1)
  }
}

module.exports = MinApp;
