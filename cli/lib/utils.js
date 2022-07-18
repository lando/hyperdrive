'use strict';

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
    console.error(error);
  }
};
