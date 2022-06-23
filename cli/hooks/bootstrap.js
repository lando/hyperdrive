const debug = require('debug')('hyperdrive:@lando/docker-desktop:hooks:bootstrap');

module.exports = async() => {
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
  debug('bootstrapping...');
  // await options.config.runHook('test', options);
};
