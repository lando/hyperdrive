
const getCurrentElementIndex = flag => {
  return process.argv.findIndex(element => element.indexOf(flag) >= 0);
};

const getCurrentElement = flag => {
  return process.argv[getCurrentElementIndex(flag)];
};

const getNextElement = flag => {
  return process.argv[getCurrentElementIndex(flag) + 1];
};

const getFlagType = flag => {
  // If the current element has an = then immediately return a string.
  if (getCurrentElement(flag).includes('=')) return 'string';

  // Check if next element is boolean or string.
  return getNextElement(flag) === undefined ||  getNextElement(flag).startsWith('-') ? 'boolean' : 'string';
};

const getStringValue = flag => {
  return getCurrentElement(flag).split('=')[1] ?? getNextElement(flag);
};

const hasOption = flag => {
  return process.argv.slice(2).some(element => element.split('=')[0] === flag);
};

const getOption = (flag, options = {}) => {
  // Immediately fail if flag is undefined, null, or empty.
  if (flag === undefined || flag === null || flag === '') throw new Error('Flag is not set');

  // If flag is boolean then return default value or true
  if (getFlagType(flag) === 'boolean') return options.defaultValue || true;

  // If flag is string, then return the string value.
  if (getFlagType(flag) === 'string') return getStringValue(flag);
};

module.exports = {
  hasOption,
  getOption,
};
