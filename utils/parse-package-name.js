/*
 * TBD
 */
module.exports = (plugin, {defaultTag = 'stable'} = {}) => {
  // parse the plugin
  const result = require('npm-package-arg')(plugin);

  // if plugin is a registry tag and has no spec then use the release channel
  if (result.registry && result.type === 'tag' && result.rawSpec === '') {
    result.rawSpec = defaultTag === 'stable' ? 'latest' : defaultTag;
    result.fetchSpec = defaultTag === 'stable' ? 'latest' : defaultTag;
    result.raw = `${result.raw}@${result.rawSpec}`;
  }

  // add a package property
  result.package = result.scope ? result.name.replace(`${result.scope}/`, '') : result.name;

  // return
  return result;
};
