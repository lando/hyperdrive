const chalk = require('chalk');
const debug = require('debug')('init:@lando/hyperdrive');
const fs = require('fs');
const path = require('path');

const {BaseCommand} = require('./../lib/base-command');
const {Command, Parser} = require('@oclif/core');

module.exports = async({id, argv, config}) => {
  // start by highlighting the basic input
  debug('running %s with %o', chalk.magenta(id), argv);
  // preemptively do a basic check for the config flag
  const {flags} = await Parser.parse(argv, {strict: false, flags: BaseCommand.globalFlags});

  // start the hyperdrive config by setting the default bootstrapper and its config
  const template = path.join(__dirname, '..', '..', 'config.yaml');
  const minstrapper = {
    // config: {},
    loader: path.join(__dirname, '..', '..', 'core', 'bootstrapper.js'),
    config: {
      dest: path.join(config.cacheDir, 'config.json'),
      env: 'HYPERDRIVE',
      product: 'hyperdrive',
      sources: {
        defaults: path.join(__dirname, '..', '..', 'config.yaml'),
        system: path.join(config.dataDir, 'config.json'),
        user: path.join(config.configDir, 'config.yaml'),
        overrides: flags.config ? path.resolve(flags.config) : undefined,
      },
      templates: {
        system: {source: template, dest: path.join(config.dataDir, 'config.json')},
        user: {source: template, dest: path.join(config.configDir, 'config.yaml')},
      },
    }
  };

  // check to see if we have a custom config file?

  // minstrap hook
  //
  // @NOTE: the minstrapper is a lightweight thing that loads the main bootstrapper. it exists primarily so that
  // hyperdrive can be modified at a very core level. this is useful if you want to distribute your own hyperdrive
  // with a different name, config set, and different "pre command" runtime.
  //
  // to that end you will want to add an OCLIF plugin and hook into the "minstrapper" event. you can replace the
  // minstrapper there. note that your even twill have access to both config and hyperdrive
  //
  await config.runHook('minstrap', {minstrapper, config});
  debug('minstrap complete, using %s as bootstrapper', minstrapper.loader);

  // get the boostrapper and run it
  const Bootstrapper = require(minstrapper.loader);
  const bootstrapper = new Bootstrapper(minstrapper.config);

  // Initialize
  // @TODO: eventually this will live in config.init and config.init will live in bootstrap.run()?
  try {
    await bootstrapper.init();
  } catch (error) {
    // @TODO: figure out how to use OCLIF error handling to print a message here?
    console.error(Error('Bootstrap failed! See error below'));
    console.error(error);
    process.exit(666);
  }

  // Get the config
  const thing = await bootstrapper.run();
  console.log('segseg')



  // copy template file over to user conf directory

  // minstrapper:
  // bootstrapper?



  // merge in all config sources and generate config file


  debug('bootstrapping...');
  // await options.config.runHook('test', options);

  // await config.runHook('config', hyperdrive);

  // debug final hyperdrive config?
  // debug final config?
};
