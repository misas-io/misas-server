#!/usr/bin/env bash

set -x
if [[ "`curl -sL -w "%{http_code}" http://rancher-metadata -o /dev/null`" == "200" ]] ; then
  # the first container for rancher service will run the migrations
  echo "rancher-metadata is reachable"
  if [[ "`curl http://rancher-metadata/2016-07-29/self/container/service_index`" == '1' ]]; then
    npm run migrate
  fi
else
  echo "rancher-metadata is not reachable"
fi
set +x
# run misas server
babel-node ./lib/server.js
