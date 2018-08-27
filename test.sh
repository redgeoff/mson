#!/usr/bin/env bash

# yarn test-server-start

# Wait for test-server to start
# ./node_modules/wait-on/bin/wait-on tcp:4002

react-scripts test --env=jsdom $@
code=$?

# yarn test-server-stop

if [ $code -ne 0 ];
  then exit $code
fi
