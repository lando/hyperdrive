'use strict';
const fs = require('fs');
const path = require('path');
const {chain, get, forEach} = require('lodash');
// Copy opts and filter out all js files
// We don't want to give the false impression that you can edit the JS
const filter = (stat, filepath, filename) => (path.extname(filename) !== '.js');

/*
 * Helper to move config from lando to a mountable directory.
 * @todo: add a default dest like os.tmpdir()?
 */
exports.moveConfig = (src, dest) => {
  const copydir = require('copy-dir');
  const mkdirp = require('mkdirp');
  // Ensure to exists
  mkdirp.sync(dest);
  // Try to copy the assets over
  try {
    // @todo: why doesn't the below work for PLD?
    copydir.sync(src, dest, filter);
    exports.makeExecutable(chain(fs.readdirSync(dest))
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
    exports.makeExecutable(chain(fs.readdirSync(dest))
    .filter(file => path.extname(file) === '.sh')
    .value()
    , dest);
  }
};

/*
 * Helper to make a file executable
 */
exports.makeExecutable = (files, base = process.cwd()) => {
  forEach(files, file => {
    fs.chmodSync(path.join(base, file), '755');
  });
};

exports.map = function(iterable, mapper, options = {}) {
  let concurrency = options.concurrency || Number.POSITIVE_INFINITY;

  let index = 0;
  const results = [];
  const pending = [];
  const iterator = iterable[Symbol.iterator]();

  while (concurrency-- > 0) {
    const thread = wrappedMapper();
    if (thread) pending.push(thread);
    else break;
  }

  return Promise.all(pending).then(() => results);

  function wrappedMapper() {
    const next = iterator.next();
    if (next.done) return null;
    const i = index++;
    const mapped = mapper(next.value, i);
    return Promise.resolve(mapped).then(resolved => {
      results[i] = resolved;
      return wrappedMapper();
    });
  }
};

// Light wrapper around popular download module.
exports.download = function(url, destination) {
  const fs = require('fs');
  const download = require('download');
  const _colors = require('ansi-colors');
  const {CliUx} = require('@oclif/core');
  let receivedBytes = 0;

  const progressBar = CliUx.ux.progress(
    {
      format: 'CLI Progress |' + _colors.magenta('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
  );

  try {
    const file = fs.createWriteStream(destination);
    download(url)
    .on('response', response => {
      const totalBytes = response.headers['content-length'];
      progressBar.start(totalBytes, 0);
    })
    .on('data', chunk => {
      receivedBytes += chunk.length;
      progressBar.update(receivedBytes);
    })
    .pipe(file);

    file.on('finish', () => {
      progressBar.stop();
      file.close();
    });
  } catch (error) {
    progressBar.stop();
    console.log(error);
  }
};
