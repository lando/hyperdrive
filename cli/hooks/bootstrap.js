const chalk = require('chalk');
const debug = require('debug')('init:@lando/hyperdrive');
const path = require('path');

const {BaseCommand} = require('./../lib/base-command');
const {Parser} = require('@oclif/core');

module.exports = async({id, argv, config}) => {
  // start by highlighting the basic input
  debug('running %s with %o', chalk.magenta(id), argv);
  // preemptively do a basic check for the config flag
  const {flags} = await Parser.parse(argv, {strict: false, flags: BaseCommand.globalFlags});

  // start the hyperdrive config by setting the default bootstrapper and its config
  const systemTemplate = path.join(__dirname, '..', '..', 'config', 'defaults.yaml');
  const userTemplate = path.join(__dirname, '..', '..', 'config', 'user.yaml');
  const minstrapper = {
    // config: {},
    loader: path.join(__dirname, '..', '..', 'core', 'bootstrap.js'),
    config: {
      cached: path.join(config.cacheDir, 'config.json'),
      env: 'HYPERDRIVE',
      id: 'hyperdrive',
      sources: {
        defaults: path.join(__dirname, '..', '..', 'config', 'defaults.yaml'),
        system: path.join(config.dataDir, 'config.json'),
        user: path.join(config.configDir, 'config.yaml'),
        overrides: flags.config ? path.resolve(flags.config) : undefined,
      },
      templates: {
        system: {source: systemTemplate, dest: path.join(config.dataDir, 'config.json')},
        user: {source: userTemplate, dest: path.join(config.configDir, 'config.yaml')},
      },
    },
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
  config.Bootstrapper = require(minstrapper.loader);
  config.bootstrap = new config.Bootstrapper(minstrapper.config);

  // Initialize
  // @TODO: could it be better to merge the result of bootstrapper.run() into config so we can load in other stuff?
  try {
    await config.bootstrap.run(config);
    debug('bootstrap completed successfully!');
  } catch (error) {
    // @TODO: figure out how to use OCLIF error handling to print a message here?
    console.error(new Error('Bootstrap failed! See error below')); // eslint-disable-line no-console
    console.error(error); // eslint-disable-line no-console
    process.exit(666); // eslint-disable-line no-process-exit
  }

  // final hook to modify the config
  await config.runHook('config', config);
};
