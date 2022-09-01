/*
 * Attempts to produce a standardized error object
 */
module.exports = ({
  all,
  args,
  command,
  error,
  errorCode,
  exitCode,
  short,
  statusCode,
  stdout,
  stderr,
}) => {
  // attempt to discover various codes
  errorCode = (error && error.code) || errorCode || undefined;
  statusCode = (error && error.statusCode) || statusCode || undefined;

  // construct a better message
  // @TODO: does this make sense?
  short = short || (error && error.reason);
  const message = [short, stdout, stderr].filter(Boolean).join('\n');

  // repurpose original error if we have one
  if (Object.prototype.toString.call(error) === '[object Error]') {
    error.originalMessage = error.message;
    error.message = message;

  // otherwise begin anew
  } else {
    error = new Error(message);
  }

  // Try to standardize things
  error.all = all;
  error.command = command;
  error.args = args;
  error.errorCode = errorCode;
  error.exitCode = exitCode;
  error.statusCode = statusCode;
  error.stdout = stdout;
  error.stderr = stderr;

  // send it back
  return error;
};
