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

    it('hasOption should return true with --debug', () => {
      const hasOption = argv.hasOption('--debug');
      expect(hasOption).to.equal(true);
    });

    it('hasOption should return false with --trill', () => {
      const hasOption = argv.hasOption('--trill');
      expect(hasOption).to.equal(false);
    });

    it('hasOption should return false with --debugs', () => {
      const hasOption = argv.hasOption('--debugs');
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

      it('getOption should return "*"', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('*');
      });

      it('getOption should not return "trill"', () => {
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

      it('getOption with equal sign should return "trill"', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('"trill"');
      });

      it('getOption with equal sign should not return "tronic"', () => {
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

      it('getOption with space should return "trill"', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('"trill"');
      });

      it('getOption with space should not return "tronic"', () => {
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

      it('getOption with multiple flags should return "*"', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('*');
      });

      it('getOption with multiple flags should not return --help', () => {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('--help');
      });
    });
  });
});
