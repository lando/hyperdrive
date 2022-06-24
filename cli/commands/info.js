const {Flags} = require('@oclif/core');
const {BaseCommand} = require('../lib/command');

class InfoCommand extends BaseCommand {
  // static _base = 'thing';
  // static id = 'thing';
  // static title = 'title';

  static description = `Shows information including downloaded version, latest available version, brief text description, etc. for the dependencies loaded dependencies for your current context, including their version, where they're being loaded from, and their context (app vs. global).`;
  // static hidden - false;

  static usage = [
    'lando info',
    'lando info --no-deps',
    'lando info -g',
    'lando info -n my-namespace'
  ];

  static args = [
    {
      name: 'plugin',
      required: true,
      description: 'The plugin or dependency to get info about.',
    }
  ];

  // static strict = false;
  // static parse = true;
  static flags = {
    'no-deps': Flags.boolean({
      description: 'Remove non-plugin dependencies (IE Lando core and Docker Desktop) from the list.',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'Show plugins and dependencies installed in the global Lando context (defaults used for all projects).',
      default: false,
    }),
    namespace: Flags.string({
      char: 'n',
      description: 'Show installed plugins in the specified namespace context (defaults used for projects using the namespace).'
    }),
    registry: Flags.string({
      char: 'r',
      description: 'NPM registry to fetch plugins from.',
      default: 'https://registry.npmjs.org',
    }),
    auth: Flags.string({
      char: 'a',
      description: 'Token to use for authentication to the specified NPM registry.',
      default: null,
    }),
  };

  // static args
  // static plugin
  // static examples
  // static parserOptions
  // static

  async run() {
    const npmFetch = require('npm-registry-fetch');
    const {args, flags} = await this.parse(InfoCommand);
    const query = `/${args.plugin}`;
    this.log(flags);
    const opts = {
      registry: flags.registry,
      '//npm.pkg.github.com/:_authToken': flags.auth,
      // Integrate config file npm section that allows you to defined npmrc options to pass in to here/other npm-related commands.
    }
    const info = await npmFetch.json(query, opts)
    this.log(info);



    // How do we get info from another registry? Authentication? Option to specify access token? Way to reference the auth and registry from a .npmrc?
    // hyperdrive info @foxcorp/foxkit-lib-common-js --auth= --registry=https://npm.pkg.github.com
  }
}

module.exports = InfoCommand;
