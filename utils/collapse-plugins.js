const map = require('lodash/map');

/*
 * Sorts through a list of plugins and sorts them based on given weights
 */
module.exports = plugins => map(plugins, list => list[0]);
