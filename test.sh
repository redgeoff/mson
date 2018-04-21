#!/usr/bin/env bash

npm run test-set-up
react-scripts test --env=jsdom $@
code=$?
npm run test-tear-down

if [ $code -ne 0 ];
  then exit $code
fi
