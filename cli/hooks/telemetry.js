const debug = require('debug')('hyperdrive:@lando/docker-desktop:hooks:bootstrap');

module.exports = async() => {
  // Fetch the default config.yml

  // Fetch the userspace configDir (/Users/alec/.config/hyperdrive)

  // Merge the config (nconf)

  // Cache the combined config in oclif's cacheDir as JSON (nconf)

  // load bootstrap config?
  // what is this exactly?
  // we need a factory function to load the correct class?
  // additional hooks?
  // pre-command modifier?
  // pre-command-THING modifier???
  // const test = options.config._commands.get('config');
  // test.description = 'whateve444r';
  // options.config._commands.set('config', test);
  // console.log(options.config._commands.get('config'));
  debug('metrics');
  // await options.config.runHook('test', options);
};
