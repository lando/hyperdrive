// Gets the current argv element index.
const getCurrentElementIndex = flag => {
  return process.argv.findIndex(element => element.indexOf(flag) >= 0);
};

// Gets the current argv element value.
const getCurrentElement = flag => {
  return process.argv[getCurrentElementIndex(flag)];
};

// Gets the next argv element value.
const getNextElement = flag => {
  return process.argv[getCurrentElementIndex(flag) + 1];
};

// Checks the flag type.
const getFlagType = flag => {
  // If the current element has an = then immediately return a string.
  if (getCurrentElement(flag).includes('=')) return 'string';

  // Check if next element is boolean or string.
  return getNextElement(flag) === undefined ||  getNextElement(flag).startsWith('-') ? 'boolean' : 'string';
};

// Gets the flag string value.
const getStringValue = flag => {
  return getCurrentElement(flag).split('=')[1] ?? getNextElement(flag);
};

/**
 * Checks if argv has the defined flag.
 *
 * @param {string} flag The flag we are checking against argv.
 * @returns {boolean} If the flag is present or not.
 */
const hasOption = flag => {
  return process.argv.slice(2).some(element => element.split('=')[0] === flag);
};

/**
 * Gets the defined flag string, boolean, or default value.
 *
 * @param {string} flag The flag value we are getting.
 * @param {object} options An object of options.
 * @returns {string|boolean} The value of the flag.
 */
const getOption = (flag, options = {}) => {
  // Immediately fail if flag is not correct, undefined, null, or empty.
  if (process.argv.slice(2).some(element => element.split('=')[0] === flag) === false) throw new Error('No such flag');

  // If flag is boolean then return default value or true
  if (getFlagType(flag) === 'boolean') return options.defaultValue || true;

  // If flag is string, then return the string value.
  return getStringValue(flag);
};

module.exports = {
  hasOption,
  getOption,
};
