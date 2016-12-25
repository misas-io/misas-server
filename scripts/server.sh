#!/usr/bin/env bash

if ping -c 3 -i 1 http://rancher-metadata/; then
  # the first container for rancher service will run the migrations
  if [[ "`curl http://rancher-metadata/2016-07-09/self/container/start_count`" == '1' ]]; then
    npm run migrate
  fi
fi
# run misas server
babel-node ./server.js
