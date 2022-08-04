#!/bin/sh
yarn init -y
yarn add $1 --no-progress --production --flat --no-default-rc --no-lockfile --link-duplicates
yarn install --no-progress --production --cwd /tmp/node_modules/$2
cp -rf /tmp/node_modules/$2/* /plugins/$2
