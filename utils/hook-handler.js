const {Errors} = require('@oclif/core');

/*
 * TBD
 */
module.exports = error => {
  const {code = 1, exit = 1, ref = null, suggestions = []} = error;
  Errors.error(error, {code, exit: false, ref, suggestions});
  process.exit(exit); // eslint-disable-line no-process-exit
};
