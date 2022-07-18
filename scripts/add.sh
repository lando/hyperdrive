#!/bin/sh
yarn init -y
yarn add $1@$2 --production --flat --no-default-rc --no-lockfile --link-duplicates
yarn install --production --cwd /tmp/node_modules/$1
cp -rf /tmp/node_modules/$1/* /plugins/$1
