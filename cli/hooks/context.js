const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:prerun-start');
const {Flags, Parser} = require('@oclif/core');

module.exports = async({argv, config}) => {
  // see if a global flag is set
  const {flags} = await Parser.parse(argv, {strict: false, flags: {global: Flags.boolean({char: 'g', default: false})}});
  // determine the context
  const context = config.app && !flags.global ? 'app' : 'global';
  config.context = {app: context === 'app', global: context === 'global'};
  debug('command is running with context %o', config.context);
};
