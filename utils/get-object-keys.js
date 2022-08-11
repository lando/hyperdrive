/*
 * Returns an array of all keys, nested or otherwise, as "." separated paths but does not expand arrays
 */
module.exports = (data, {prefix = '', expandArrays = true, separator = '.'} = {}) => {
  // eslint-disable-next-line unicorn/no-array-reduce
  return Object.keys(data).reduce((keys, key) => {
    // if we have a primitive then return the path
    if (!data[key] || typeof data[key] !== 'object' || Object.keys(data[key]).length === 0) {
      return [...keys, `${prefix}${key}`];
    }

    // if we arent expanding arrays then dont return paths with array indexes
    if (!expandArrays && Array.isArray(data[key])) {
      return [...keys, `${prefix}${key}`];
    }

    // otherwise cycle through again
    return [...keys, ...module.exports(data[key], {expandArrays, prefix: `${prefix}${key}${separator}`})];
  }, []);
};
