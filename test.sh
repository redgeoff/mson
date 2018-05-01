#!/usr/bin/env bash

yarn test-server-start
react-scripts test --env=jsdom $@
code=$?
yarn test-server-stop

if [ $code -ne 0 ];
  then exit $code
fi
