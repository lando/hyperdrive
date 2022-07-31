const {execSync} = require('child_process');
/*
 * Sorts through a list of plugins and sorts them based on given weights
 */
module.exports = (cmd, options) => JSON.parse(execSync(cmd, {maxBuffer: 1024 * 1024 * 10, encoding: 'utf-8', ...options}));
