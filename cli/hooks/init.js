'use strict';

// @NOTE: We use LET so we can rename the debugger as needed
const createDebugger = require('./../../lib/debug');
const path = require('path');
const Ministrapper = require('./../../lib/ministrapper');

module.exports = async({id, argv, config}) => {
  let debug = createDebugger(config.dirname, 'hooks', 'init');
  const sourceConfig =  path.join(__dirname, '..', '..', 'config.yml');
  const userConfig = path.join(config.configDir, 'config.yml');

  // @TODO: set this based on some options (--debug?). if boolean/null should set * if string should set as if DEBUG
  //        envvar was set.
  // @NOTE: this shows all debug right now for dev purposes. see @TODO above.
  require('debug').enable('*'); // eslint-disable-line node/no-extraneous-require
  debug('cli init start with id=%s, argv=%O', id, argv);

  // Get config vars
  const ENV_PREFIX = process.env.HYPERDRIVE_BOOTSTRAP_ENV_PREFIX || 'HYPERDRIVE';
  const ENV_SEPARATOR = process.env.HYPERDRIVE_BOOTSTRAP_ENV_SEPARATOR || '_';

  // Build up hyperdrive/product config from various sources
  const bootstrapConf = new Ministrapper([config.name, 'lib', 'ministrapper']);

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
    mode: 'cli',
    leia: Object.prototype.hasOwnProperty.call(process.env, 'LEIA_PARSER_RUNNING'),
    packaged: Object.prototype.hasOwnProperty.call(process, 'pkg'),
    product: 'hyperdrive',
  });
  debug('get config from defaults');

  // Reset debugger to indicate product status
  debug = createDebugger(bootstrapConf.get('product'), 'hooks', 'init');
  debug('bootstrap config set to %O', bootstrapConf.get());

  // Set DEBUG=* when -vvv is set?
  // run bootstrap
  // 1. merge in more config
  // 2. go through plugins and build manifest of components/config/whatever
  // 3. traverse plugins to find commands
  // 4. what do commandIDs do?
  // 5. install defaults eg desktop -> lando-desktop
  /*
      hyperdrive:
        // list of installers
        installers:

        // Just OCLIF command objects, this is just a list of metadata
        commands:
          - {id: 'install', variant: 'lando-docker-engine', path:  }

        plugins:
          - pathtofunction -> gets config and returns plugin

        // Final mods to commands, useful to add more options/args etc
        mods: (?)
          - {id: 'install', path: }

  // commands = [require('./../more/bye')];
  // config.plugins.push(new DynamicPlugin(config))
  // console.log(config.plugins);
  // config.plugins[0].commands[0].flags.stuff = flags.string({char: 'z', description: 'name to print'});
  // console.log(id, argv, config); // {id, argv, conf}

    */
};
