
const hasOption = option => {
  return process.argv.slice(2).some(element => element.includes(option));
};

const getOption = (option, args) => {
  const defaultValue = Object.prototype.hasOwnProperty.call(args, 'defaultValue') ? args.defaultValue : '';
  const optionIndex = process.argv.findIndex(element => element.indexOf(option) >= 0);
  const rawOption = process.argv[optionIndex];

  let optionValue;
  if (rawOption.indexOf('=') >= 0) {
    optionValue = rawOption.split('=')[1];
  } else {
    const checkNext = process.argv[optionIndex + 1];
    optionValue = checkNext === undefined || checkNext.indexOf('--') >= 0 ? defaultValue : checkNext;
  }

  return optionValue;
};

module.exports = {
  hasOption,
  getOption,
};
