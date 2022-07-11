const copydir = require('copy-dir');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const filter = (stat, filepath, filename) => (path.extname(filename) !== '.js');

/*
 * Helper to move config from lando to a mountable directory.
 * @todo: add a default dest like os.tmpdir()?
 */
function moveConfig(src, dest) {
  // Ensure to exists
  mkdirp.sync(dest);
  // Try to copy the assets over
  try {
    // Copy opts and filter out all js files
    // We don't want to give the false impression that you can edit the JS
    copydir.sync(src, dest, filter);
    makeExecutable(_(fs.readdirSync(dest))
    .filter(file => path.extname(file) === '.sh')
    .value()
    , dest);
  } catch (error) {
    const code = _.get(error, 'code');
    const syscall = _.get(error, 'syscall');
    const f = _.get(error, 'path');

    // Catch this so we can try to repair
    if (code !== 'EISDIR' || syscall !== 'open' || Boolean(mkdirp.sync(f))) {
      throw new Error(error);
    }

    // Try to take corrective action
    fs.unlinkSync(f);
    copydir.sync(src, dest, filter);
    makeExecutable(_.chain(fs.readdirSync(dest))
    .filter(file => path.extname(file) === '.sh')
    .value()
    , dest);
  }
}

function makeExecutable(files, base = process.cwd()) {
  _.forEach(files, file => { // eslint-disable-line unicorn/no-array-for-each
    fs.chmodSync(path.join(base, file), '755');
  });
}

module.exports = moveConfig;
