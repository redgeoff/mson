#!/usr/bin/env bash

maxBytes=280000

if [ $(wc -c < dist/mson.js) -gt ${maxBytes} ]; then
  echo 'Error: bundle too large!'
  exit 1
fi
