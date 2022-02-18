#!/usr/bin/env bash

maxBytes=298000
bundleSize=$(wc -c < dist/mson.js)

if [ ${bundleSize} -gt ${maxBytes} ]; then
  echo "Error: bundle (${bundleSize} bytes) is large than ${maxBytes} bytes!"
  exit 1
fi
