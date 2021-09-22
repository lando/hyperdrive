/* eslint-disable no-console */
let debug;
try {
  debug = require('debug'); // eslint-disable-line node/no-extraneous-require
} catch (error) {}

const displayWarnings = () => {
  if (process.listenerCount('warning') > 1) return;
  process.on('warning', warning => {
    console.error(warning.stack);
    if (warning.detail) console.error(warning.detail);
  });
};

module.exports = (...namespacers) => {
  if (!debug) return (..._) => {};
  const bug = debug([...namespacers].join(':'));
  if (bug.enabled) displayWarnings();
  return (...args) => bug(...args);
};
