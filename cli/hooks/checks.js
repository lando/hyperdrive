const debug = require('debug')('hyperdrive:@lando/hyperdrive:hooks:bootstrap-preflight');
const fs = require('fs');
const path = require('path');

module.exports = async({config}) => {
  // get the main things
  const {arch, bin, cacheDir, platform} = config;
  const uid = process.getuid ? process.getuid() : '-1';
  const env = process.pkg ? 'prod' : 'dev';

  // for performance purposes save a hash of arch/platform/user and only reevaluate if the hash does not exist
  // if the hash does exist then it means we are good
  const compatFile = path.join(cacheDir, 'compat.json');
  const compatKey = Buffer.from(`${arch}:${platform}:${uid}:${env}`, 'utf8').toString('base64');

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

  // check arch
  const supportedArchs = ['amd64', 'arm64', 'aarch64', 'x64'];
  if (!supportedArchs.includes(arch)) {
    const error = new Error(`${arch} is not a supported architecture!`);
    error.code = 'HDUNARCH';
    error.ref = 'https://docs.lando.dev/hyperdrive/requirements';
    error.suggestions = [
      `Run ${bin} on one of the following architectures: ${supportedArchs.join('|')}`,
      'Read https://docs.lando.dev/hyperdrive/requirements',
    ];
    throw error;
  }

  // check platform
  const supportedPlatforms = ['darwin', 'linux', 'win32', 'wsl'];
  if (!supportedPlatforms.includes(platform)) {
    const error = new Error(`${platform} is not a supported platform!`);
    error.code = 'HDUNPLAT';
    error.ref = 'https://docs.lando.dev/hyperdrive/requirements';
    error.suggestions = [
      `Run ${bin} on one of the following platforms: ${supportedPlatforms.join('|')}`,
      'Read https://docs.lando.dev/hyperdrive/requirements',
    ];
    throw error;
  }

  // check user
  if (require('is-root')() && !require('is-docker')()) {
    const error = new Error(`${bin} cannot be run as root!`);
    error.code = 'HDNOROOT';
    error.ref = 'https://docs.lando.dev/hyperdrive/requirements';
    error.suggestions = [
      `Run ${bin} as a non-root user eg uid != 0`,
      'Read https://docs.lando.dev/hyperdrive/requirements',
    ];
    throw error;
  }

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
