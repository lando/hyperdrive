
const hasOption = (option) => {
  return process.argv.slice(2).some(element => element.includes(option));
}
 
const getOption = (option, args) => {
  const defaultValue = args.hasOwnProperty('defaultValue') ? args.defaultValue : '';
  const optionIndex = process.argv.indexOf(option);

  let optionValue;
  if (option.indexOf('=') >= 0) {
    optionValue = option.split('=')[1];
  }
  else {
    const checkNext = process.argv[optionIndex + 1];
    optionValue = checkNext === undefined || checkNext.indexOf('--') >= 0 ? defaultValue : checkNext;
  }

  return optionValue;
}
 
module.exports = {
  hasOption, 
  getOption,
};