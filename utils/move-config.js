const copydir = require('copy-dir');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const {get, chain, forEach} = require('lodash');

/*
 * Helper to move config from lando to a mountable directory.
 * @todo: add a default dest like os.tmpdir()?
 */
function moveConfig(src, dest) {
  // Copy opts and filter out all js files
  // We don't want to give the false impression that you can edit the JS
  const filter = (stat, filepath, filename) => (path.extname(filename) !== '.js');
  // Ensure to exists
  mkdirp.sync(dest);
  // Try to copy the assets over
  try {
    // @todo: why doesn't the below work for PLD?
    copydir.sync(src, dest, filter);
    makeExecutable(chain(fs.readdirSync(dest))
    .filter(file => path.extname(file) === '.sh')
    .value()
    , dest);
  } catch (error) {
    const code = get(error, 'code');
    const syscall = get(error, 'syscall');
    const f = get(error, 'path');

    // Catch this so we can try to repair
    if (code !== 'EISDIR' || syscall !== 'open' || Boolean(mkdirp.sync(f))) {
      throw new Error(error);
    }

    // Try to take corrective action
    fs.unlinkSync(f);
    copydir.sync(src, dest, filter);
    makeExecutable(chain(fs.readdirSync(dest))
    .filter(file => path.extname(file) === '.sh')
    .value()
    , dest);
  }
};

function makeExecutable(files, base = process.cwd()) {
  forEach(files, file => {
    fs.chmodSync(path.join(base, file), '755');
  });
};

module.exports = moveConfig;
