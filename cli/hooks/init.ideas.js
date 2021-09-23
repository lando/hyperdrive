// @NOTE: We use LET so we can rename the debugger as needed
const createDebugger = require('../../utils/debug');
const path = require('path');
const Ministrapper = require('../../utils/ministrapper');

module.exports = async({id, argv, config}) => {
  let debug = createDebugger(config.dirname, 'hooks', 'init');
  const sourceConfig =  path.join(__dirname, '..', '..', 'config.yml');
  const userConfig = path.join(config.configDir, 'config.yml');

  // @TODO: set this based on some options (--debug?). if boolean/null should set * if string should set as if DEBUG
  //        envvar was set.
  // @NOTE: this shows all debug right now for dev purposes. see @TODO above.
  require('debug').enable('*'); // eslint-disable-line node/no-extraneous-require
  debug('cli init start with id=%s, argv=%O', id, argv);

  // if config cache exists then just load that and move on?

  // Get config vars
  const ENV_PREFIX = process.env.HYPERDRIVE_BOOTSTRAP_ENV_PREFIX || 'HYPERDRIVE';
  const ENV_SEPARATOR = process.env.HYPERDRIVE_BOOTSTRAP_ENV_SEPARATOR || '_';

  // Build up hyperdrive/product config from various sources
  const bootstrapConf = new Ministrapper([config.name, 'utils', 'ministrapper']);

  // @NOTE: do we want to accept some hidden args for this eg `hyperdrive --config bootstrap.module=something?`
  // ENVARS are highest priority
  bootstrapConf.env(ENV_PREFIX, ENV_SEPARATOR);
  debug('get config from %s%s* envvars done', ENV_PREFIX, ENV_SEPARATOR);

  // Then user config if it exists
  bootstrapConf.file('user', {file: userConfig, format: require('nconf-yaml')});
  debug('get config from file %s done', userConfig);

  // Then source config
  bootstrapConf.file('source', {file: sourceConfig, format: require('nconf-yaml')});
  debug('get config from file %s done', sourceConfig);

  // Then defaults
  bootstrapConf.defaults({
    product: 'hyperdrive',
    mode: 'cli',
    bootstrap: {
      module: path.join(__dirname, '..', '..', 'utils', 'bootstrap.js'),
      env: {
        separator: '_',
        prefix: 'HYPERDRIVE',
      },
      landoPlugins: true,
      // @TODO: core plugin() below?
      /*
        plugins/core
        plugins/
      */
      plugins: [],
      // @TODO:
      pluginDirs: [],
    },
  });
  debug('get config from defaults');

  // @TODO: optionally add in lando plugin dirs?
  // @NOTE: this will need to do a light lando bootstrap to get plugin dirs and such
  // plugin manifests should be yaml eg dumpable to file

  // Reset debugger to indicate product status
  debug = createDebugger(bootstrapConf.get('product'), 'hooks', 'init');
  debug('bootstrap config set to %O', bootstrapConf.get('source'));

  // @TODO: load in oclif somewhere?
  // leia: Object.prototype.hasOwnProperty.call(process.env, 'LEIA_PARSER_RUNNING'),
  // packaged: Object.prototype.hasOwnProperty.call(process, 'pkg'),

  // merge in some oclif stuff?

  // 0. need to add plugins and plugin dirs to bootstrap config
  // 1. Check if bootstrap exists, throw error if not
  // 1. bootstrap hook?
  // 2. run bootstrap
  //  * consolidate and organize plugins
  //    * external plugins
  //    * ./plugins
  //    * dataDir/plugins
  //  *  build plugin manifest/registry
  //  * load plugins
  // 3. hook?
  // 4. merge into config?

  // run bootstrap
  // 1. merge in more config
  // 2. go through plugins and build manifest of components/config/whatever
  // 3. traverse plugins to find commands

  // *. what do commandIDs do?
  // *. install defaults eg desktop -> lando-desktop
  /*
  // commands = [require('./../more/bye')];
  // config.plugins.push(new DynamicPlugin(config))
  // console.log(config.plugins);
  // config.plugins[0].commands[0].flags.stuff = flags.string({char: 'z', description: 'name to print'});
  // console.log(id, argv, config); // {id, argv, conf}

    */
};
