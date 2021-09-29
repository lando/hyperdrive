const argv = require('../../utils/argv');
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('argv', () => {
  describe('hasOption', function() {
    beforeEach(function() {
      process.argv = [
        'node',
        'hyperdrive',
        'list',
        '--debug',
      ];
    });

    it('hasOption should return true with --debug', function() {
      const hasOption = argv.hasOption('--debug');
      expect(hasOption).to.equal(true);
    });

    it('hasOption should return false with --trill', function() {
      const hasOption = argv.hasOption('--trill');
      expect(hasOption).to.equal(false);
    });

    it('hasOption should return false with --debugs', function() {
      const hasOption = argv.hasOption('--debugs');
      expect(hasOption).to.equal(false);
    });
  });

  describe('getOption', function() {
    describe('wildcard', function() {
      beforeEach(function() {
        process.argv = [
          'node',
          'hyperdrive',
          'list',
          '--debug',
        ];
      });

      it('getOption should return "*"', function() {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('*');
      });

      it('getOption should not return "trill"', function() {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('trill');
      });
    });

    describe('namespace with equal sign', function() {
      beforeEach(function() {
        process.argv = [
          'node',
          'hyperdrive',
          'list',
          '--debug="trill"',
        ];
      });

      it('getOption with equal sign should return "trill"', function() {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('"trill"');
      });

      it('getOption with equal sign should not return "tronic"', function() {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('"tronic"');
      });
    });

    describe('namespace with space', function() {
      beforeEach(function() {
        process.argv = [
          'node',
          'hyperdrive',
          'list',
          '--debug "trill"',
        ];
      });

      it('getOption with space should return "trill"', function() {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.equal('"trill"');
      });

      it('getOption with space should not return "tronic"', function() {
        const getOption = argv.getOption('--debug', {defaultValue: '*'});
        expect(getOption).to.not.equal('"tronic"');
      });
    });
  });
});
