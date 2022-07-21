#!/bin/sh
yarn init -y
yarn add $1 --production --flat --no-default-rc --no-lockfile --link-duplicates
yarn install --production --cwd /tmp/node_modules/$2
cp -rf /tmp/node_modules/$2/* /plugins/$2
