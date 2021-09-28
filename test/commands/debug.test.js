const {expect, test} = require('@oclif/test');

describe('debug', () => {
  test
  .stdout()
  .command(['list'])
  .it('runs list', ctx => {
    expect(ctx.stdout).to.contain('hello world');
  });

  // test
  // .stdout()
  // .command(['list', '--name', 'pirog'])
  // .it('runs list --name pirog', ctx => {
  //   expect(ctx.stdout).to.contain('pirog');
  // });

  test
  .stdout()
  .command(['list', '--debug'])
  .it('runs list --debug', ctx => {
    expect(ctx.stdout).to.contain('world');
  });
});
