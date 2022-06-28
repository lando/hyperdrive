#!/bin/sh
yarn init -y
yarn add $1 --production --flat --no-default-rc --no-lockfile --link-duplicates
yarn install --production --cwd /tmp/node_modules/$1
if [ $2 ]
then
  mkdir -p /plugins/$2
fi
mv --force /tmp/node_modules/$1 /plugins/$1
