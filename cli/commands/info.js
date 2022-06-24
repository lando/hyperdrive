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
    })
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
    const opts = {
      // Integrate config file npm section that allows you to define npmrc options to pass in to here/other npm-related commands.
      // npm-registry-fetch commands: https://www.npmjs.com/package/npm-registry-fetch
      // npm config: https://docs.npmjs.com/cli/v8/using-npm/config
/*       registry: '',
      agent: this.config['user-agent'],
      gzip: 'does not exist',
      headers: 'does not exist',
      ignoreBody: 'does not exist',
      integrity: 'does not exist',
      mapJSON: 'does not exist',
      maxSockets: this.config['maxsockets'],
      method: 'does not exist',
      npmSession: 'does not exist',
      npmCommand: 'does not exist',
      otpPrompt: 'does not exist; maybe want a default function here?',
      // Basic auth password...I'm not sure if this is supported in modern npm config
      password: this.config['_auth'],
      query: 'does not exist',
      retry: 'does not exist; this is just an object-value alternative to pass in values provided a single properties by config...not needed',
      spec: 'does not exist',
      timeout: this.config['fetch-timeout'],
      // I think this is the correct mapping
      _authToken: this.config['_auth'],
      username: 'does not exist; believe basic auth is not supported in modern npm config',
 */
      //This is the format required for authing with an authtoken...maybe put this in a demo config file.
      '//<npm.pkg.github.com>/:_authToken': 'THE AUTH TOKEN',
    }
    const info = await npmFetch.json(query, opts)
    this.log(info);
  }
}

module.exports = InfoCommand;
