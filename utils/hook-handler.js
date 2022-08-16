const {Errors} = require('@oclif/core');

module.exports = error => {
  const {message = 'something bad happened!', code = 1, exit = 1, ref = null, suggestions = []} = error;
  Errors.error(message, {code, exit: false, ref, suggestions});
  process.exit(exit); // eslint-disable-line no-process-exit
};
