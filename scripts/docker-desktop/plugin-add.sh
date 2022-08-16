#!/bin/sh
npm init -y
npm add $1 --no-progress --production --flat --no-default-rc --no-lockfile --link-duplicates
npm install --no-progress --production -C /tmp/node_modules/$2
cp -rf /tmp/node_modules/$2/* /plugins/$2
