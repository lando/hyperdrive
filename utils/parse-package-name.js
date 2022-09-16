/*
 * TBD
 */
module.exports = (plugin, {defaultTag = 'stable'} = {}) => {
  // parse the plugin
  const result = require('npm-package-arg')(plugin);

  // if plugin is a registry tag and has no spec then use the release channel
  if (result.registry && result.type === 'tag' && result.rawSpec === '') {
    result.landoSpec = defaultTag === 'stable' ? 'latest' : defaultTag;
    result.raw = `${result.raw}@${result.landoSpec}`;
  }

  // add a package property
  result.package = result.scope ? result.name.replace(`${result.scope}/`, '') : result.name;
  // if we have an explict non-tag peg then lets set it
  if (result.type !== 'tag') result.peg = result.saveSpec || result.rawSpec;
  else if (result.rawSpec !== '') result.peg = result.rawSpec;

  // return
  return result;
};
