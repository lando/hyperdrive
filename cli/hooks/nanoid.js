const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-config-pre');

module.exports = async({config}) => {
  // get some stuff we need
  const {hyperdrive} = config;
  // if we dont have an instance id then compute and dump
  if (!hyperdrive.config.get('system.instance', hyperdrive.config.managed)) {
    const {nanoid} = require('nanoid');
    const data = {system: {instance: nanoid()}};
    hyperdrive.config.save(data);
    hyperdrive.config.defaults(data);
    debug('could not locate instance id, setting to %o', hyperdrive.config.get('system.instance'));
  }
};
