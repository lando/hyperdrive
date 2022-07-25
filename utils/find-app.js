const fs = require('fs');
const traverseUp = require('./traverse-up');

module.exports = (files, startFrom) => traverseUp(files, startFrom).find(file => fs.existsSync(file));
