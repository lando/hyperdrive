
const argv = require('../../utils/argv');
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('hasOption', () => {
  it('should return true', () => {
    process.argv = [
      'node',
      'hyperdrive',
      'list',
      '--debug',
    ];
    const hasOption = argv.hasOption('--debug');
    expect(hasOption).to.equal(true);
  });

  it('should return false', () => {
    process.argv = [
      'node',
      'hyperdrive',
      'list',
      '--debug',
    ];
    const hasOption = argv.hasOption('--trill');
    expect(hasOption).to.equal(false);
  });
});
