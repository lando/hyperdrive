module.exports = async({argv, config, Command}) => {
  // @TODO: do we need more events here?
  // break prerun into a few different hooks
  //
  // intended to do any modifications to argv/config/Command before other prerun hooks run
  await config.runHook('prerun-start', {argv, config, Command});
  // intended to load or set any deps required by the command
  await config.runHook('prerun-deps', {argv, config, Command});
  // intended for any final prerun considerations
  await config.runHook('prerun-final', {argv, config, Command});
};
