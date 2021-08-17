#!/usr/bin/env node
/* eslint-disable node/no-unpublished-require */

/*
 * This is a nifty cross platform script that will replace relevant versions
 * in json files with a "dev" version generated with `git describe`
 */

'use strict';

// Grab needed modules
const _ = require('lodash');
const {cli} = require('cli-ux');
const execa = require('execa');
const fs = require('fs');
const handler = require('@oclif/errors/handle');

// Start our sacred promise
execa('git', ['describe', '--tags', '--always', '--abbrev=1'])

// Trim the tag
.then(data => _.trim(data.stdout.slice(1)))

// Replace the version for our files
.then(version => {
  const packageJson = require('./../package.json');
  packageJson.version = version;
  cli.action.start(`Updating package.json to dev version ${packageJson.version}`);
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
  return cli.wait(_.random(1000, 3000));
})

// Flag success
.then(() => cli.action.stop())

// Catch errors and do stuff so we can break builds when this fails
.catch(error => handler(error));
