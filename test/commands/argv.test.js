const argv = require('../../utils/argv');
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('argv', () => {
  describe('hasOption', () => {
    beforeEach(() => {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
      ];
    });

    it('should return true if option exists in argv', () => {
      const hasOption = argv.hasOption('--debug');
      expect(hasOption).to.equal(true);
    });

    it('should return false if option does not exist in argv', () => {
      const hasOption = argv.hasOption('--trill');
      expect(hasOption).to.equal(false);
    });
  });

  describe('getOption', () => {
    describe('wildcard', () => {
      beforeEach(() => {
        process.argv = [
          'node',
          'hyperdrive',
          'list',
          '--debug',
        ];
      });

      it('should return default flag if option is boolean and matches argv', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('*');
      });

      it('should not return default flag if option is boolean and does not match argv', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('trill');
      });
    });

    describe('namespace with equal sign', () => {
      beforeEach(() => {
        process.argv = [
          'node',
          'hyperdrive',
          'list',
          '--debug="trill"',
        ];
      });

      it('should match string if option is string with equal sign and flag matches argv', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('"trill"');
      });

      it('should not match string if option is string with equal sign and flag does not matche argv', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('"tronic"');
      });
    });

    describe('namespace with space', () => {
      beforeEach(() => {
        process.argv = [
          'node',
          'hyperdrive',
          'list',
          '--debug',
          '"trill"',
        ];
      });

      it('should match string if option is string with space after flag and flag matches argv', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('"trill"');
      });

      it('should not match string if option is string with space after flag and flag does not match argv', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('"tronic"');
      });
    });

    describe('wildcard with multiple flags', () => {
      beforeEach(() => {
        process.argv = [
          'node',
          'hyperdrive',
          'list',
          '--debug',
          '--help',
        ];
      });

      it('should return default flag if option is boolean, matches argv, and multiple flags are present', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('*');
      });

      it('should not return next flag if option is boolean, matches argv, and multiple flags are present', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('--help');
      });
    });
  });
});
