const {expect, test} = require('@oclif/test');

describe('test', () => {
  test
  .stdout()
  .command(['test'])
  .it('runs the test command', ctx => {
    expect(ctx.stdout).to.contain('test');
  });
});
