
function map(iterable, mapper, options = {}) {
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
}

module.exports = map;
