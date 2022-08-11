const {execSync} = require('child_process');

/*
 * TBD
 */
module.exports = (cmd, options) => JSON.parse(execSync(cmd, {maxBuffer: 1024 * 1024 * 10, encoding: 'utf-8', ...options}));
