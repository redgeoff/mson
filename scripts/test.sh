#!/usr/bin/env bash

# yarn test-server-start

# Wait for test-server to start
# ./node_modules/wait-on/bin/wait-on tcp:4002

# As per
# https://facebook.github.io/jest/docs/en/troubleshooting.html#tests-are-extremely-slow-on-docker-and-or-continuous-integration-ci-server
# to prevent test timeouts
react-scripts test --env=jsdom --maxWorkers=3 $@
code=$?

# yarn test-server-stop

if [ $code -ne 0 ];
  then exit $code
fi
