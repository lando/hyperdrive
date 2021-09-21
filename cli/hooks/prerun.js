const _ = require('lodash');
const {flags} = require('@oclif/command');

module.exports = async options => {
  // options.Command = require('./../commands/hello2');
  // console.log(options);
  // options.Command.flags.name2 = flags.string({char: 'z', description: 'name to print'}),


  console.log(`example prerun hook running before ${options.id}`)
}
