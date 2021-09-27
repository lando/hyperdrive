const {expect, test} = require('@oclif/test');

describe('install', () => {
  test
  .stdout()
  .command(['install'])
  .it('runs install', ctx => {
    expect(ctx.stdout).to.contain('install plugin');
  });

  test
  .stdout()
  .command(['install', 'docker-desktop'])
  .it('runs install docker-desktop', ctx => {
    expect(ctx.stdout).to.contain('install docker-desktop');
  });
});
