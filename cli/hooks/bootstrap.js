const chalk = require('chalk');
const debug = require('debug')('init:@lando/hyperdrive');
const fs = require('fs');
const path = require('path');

module.exports = async({id, argv, config}) => {
  // start by highlighting the basic input
  debug('running %s with %o', chalk.magenta(id), argv);

  // start the hyperdrive config by setting the default bootstrapper
  const hyperdrive = {boostrapper: path.join(__dirname, '..', '..', 'core', 'bootstrapper.js')};
  // check to see if we have a custom config file?

  // process.exit(1)

  console.log(Parser)
  console.log(await Parser.parse(argv, {
    flags: {
      config: Parser.flags.string({
        char: 'c',
        description: 'Uses configuration from specified file',
        env: 'HYPERDRIVE_CONFIG_FILE',
        default: undefined,
        helpGroup: 'GLOBAL',
      })
    }
  }));

  // minstrap hook
  //
  // @NOTE: the minstrapper is a lightweight thing that loads the main bootstrapper. it exists primarily so that
  // hyperdrive can be modified at a very core level. this is useful if you want to distribute your own hyperdrive
  // with a different name, config set, and different "pre command" runtime.
  //
  // to that end you will want to add an OCLIF plugin and hook into the "minstrapper" event. you can replace the
  // minstrapper there. note that your even twill have access to both config and hyperdrive
  //
  await config.runHook('minstrap', {config, hyperdrive});
  debug('minstrap complete, using %s as bootstrapper', hyperdrive.boostrapper);

  // get the boostrapper and run it
  const Bootstrapper = require(hyperdrive.boostrapper);
  const bootstrapper = new Bootstrapper({id, argv, config});

  const thing = await bootstrapper.run();




  // copy template file over to user conf directory

  // minstrapper:
  // bootstrapper?



  // merge in all config sources and generate config file


  debug('bootstrapping...');
  // await options.config.runHook('test', options);

  await config.runHook('config', hyperdrive);

  // debug final hyperdrive config?
  // debug final config?
};
