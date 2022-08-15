/* eslint-disable node/no-unsupported-features/es-syntax */
const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-preflight');
const fs = require('fs');
const path = require('path');

module.exports = async({config}) => {
  // get the main things
  const {arch, bin, cacheDir, platform} = config;

  // for performance purposes save a hash of arch/platform/user and only reevaluate if the hash does not exist
  // if the hash does exist then it means we are good
  const compatFile = path.join(cacheDir, 'compat.json');
  const compatKey = Buffer.from(`${arch}:${platform}:${process.getuid()}`, 'utf8').toString('base64');

  // if we have a compatfile then lets try to load it up so we can skip the checks
  if (fs.existsSync(compatFile)) {
    try {
      const compatMap = require(compatFile);
      if (compatMap[compatKey] === true) {
        debug('compat hash match. skipping compat checks.');
        return;
      }
    } catch (error) {
      debug('could not load %o with error %o, unlinking...', compatFile, error);
      fs.unlinkSync(compatFile);
    }
  }

  // otherwise do the checks
  const supportedPlatform = ['darwin', 'linux', 'win32', 'wsl'];
  const supportedArch = ['amd64', 'arm64', 'aarch64', 'x64'];
  // check helpers
  const isDocker = await import('is-docker');
  const isRoot = await import('is-root');

  // check arch
  if (!supportedArch.includes(arch)) throw new Error(`${arch} is not a supported architecture!`);

  // check platform
  if (!supportedPlatform.includes(platform)) throw new Error(`${platform} is not a supported platform!`);

  // check user
  if (isRoot.default() && !isDocker.default()) throw new Error(`${bin} cannot be run as root!`);

  // @TODO: error if running with admin perms on windows?
  // not 100% sure if this matters but worth investigating?

  // if we get here we can write the compat hashmap
  try {
    const data = fs.existsSync(compatFile) ? JSON.parse(fs.existsSync(compatFile)) : {};
    data[compatKey] = true;
    fs.writeFileSync(compatFile, JSON.stringify(data));
  } catch (error) {
    debug('something went wrong saving the compat hashmap, not critical so just ignoring. error was %o', error);
  }
};
