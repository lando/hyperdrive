const argv = require('../../utils/argv');
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('argv', () => {
  describe('hasOption', () => {
    it('should return true if option exists in argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
      ];
      const hasOption = argv.hasOption('--debug');
      hasOption.should.equal(true);
    });

    it('should return false if option does not exist in argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
      ];
      const hasOption = argv.hasOption('--trill');
      hasOption.should.equal(false);
    });
  });

  describe('getOption', () => {
    it('should return default flag if option is boolean and matches argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.equal('*');
    });

    it('should return true if option is boolean, matches argv, and default value is not set', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
      ];
      const getOption = argv.getOption('--debug');
      getOption.should.equal(true);
    });

    it('should not return default flag if option is boolean and does not match argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.not.equal('trill');
    });

    it('should match string if option is string with equal sign and flag matches argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug="trill"',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.equal('"trill"');
    });

    it('should not match string if option is string with equal sign and flag does not matche argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug="trill"',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.not.equal('"tronic"');
    });

    it('should match string if option is string with space after flag and flag matches argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
        '"trill"',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.equal('"trill"');
    });

    it('should not match string if option is string with space after flag and flag does not match argv', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
        '"trill"',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.not.equal('"tronic"');
    });

    it('should return default flag if option is boolean, matches argv, and multiple flags are present', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
        '--help',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.equal('*');
    });

    it('should not return next flag if option is boolean, matches argv, and multiple flags are present', () => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
        '--help',
      ];
      const getOption = argv.getOption('--debug', {defaultValue: '*'});
      getOption.should.not.equal('--help');
    });

    it('should throw an error as flag is set incorrectly', () => {
      expect(() => argv.getOption('--trill', {defaultValue: '*'})).to.throw(Error); // eslint-disable-line max-nested-callbacks
    });

    it('should throw an error as flag is empty', () => {
      expect(() => argv.getOption('')).to.throw(Error); // eslint-disable-line max-nested-callbacks
    });

    it('should throw an error as flag is undefined', () => {
      expect(() => argv.getOption()).to.throw(Error); // eslint-disable-line max-nested-callbacks
    });

    it('should throw an error as flag is null', () => {
      expect(() => argv.getOption(null)).to.throw(Error); // eslint-disable-line max-nested-callbacks
    });
  });
});
