'use strict';
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/*
 * Helper to move config from lando to a mountable directory
 */
exports.moveConfig = (src, dest = os.tmpdir()) => {
  const copydir = require('copy-dir');
  const mkdirp = require('mkdirp');
  // Copy opts and filter out all js files
  // We don't want to give the false impression that you can edit the JS
  const filter = (stat, filepath, filename) => (path.extname(filename) !== '.js');
  // Ensure to exists
  mkdirp.sync(dest);
  // Try to copy the assets over
  try {
    // @todo: why doesn't the below work for PLD?
    copydir.sync(src, dest, filter);
    exports.makeExecutable(_(fs.readdirSync(dest))
      .filter(file => path.extname(file) === '.sh')
      .value()
    , dest);
  } catch (error) {
    const code = _.get(error, 'code');
    const syscall = _.get(error, 'syscall');
    const f = _.get(error, 'path');

    // Catch this so we can try to repair
    if (code !== 'EISDIR' || syscall !== 'open' || !!mkdirp.sync(f)) {
      throw new Error(error);
    }

    // Try to take corrective action
    fs.unlinkSync(f);
    copydir.sync(src, dest, filter);
    exports.makeExecutable(_(fs.readdirSync(dest))
      .filter(file => path.extname(file) === '.sh')
      .value()
    , dest);
  };
};

/*
 * Helper to make a file executable
 */
exports.makeExecutable = (files, base = process.cwd()) => {
  _.forEach(files, file => {
    fs.chmodSync(path.join(base, file), '755');
  });
};

exports.map = function (iterable, mapper, options = {}) {
  let concurrency = options.concurrency || Infinity

  let index = 0
  const results = []
  const pending = []
  const iterator = iterable[Symbol.iterator]()

  while (concurrency-- > 0) {
    const thread = wrappedMapper()
    if (thread) pending.push(thread)
    else break
  }

  return Promise.all(pending).then(() => results)

  function wrappedMapper () {
    const next = iterator.next()
    if (next.done) return null
    const i = index++
    const mapped = mapper(next.value, i)
    return Promise.resolve(mapped).then(resolved => {
      results[i] = resolved
      return wrappedMapper()
    })
  }
}
