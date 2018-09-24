#!/usr/bin/env bash

maxBytes=1500000

if [ $(wc -c < build/static/js/main.*.js) -gt ${maxBytes} ]; then
  echo 'Error: Bundle too large!'
  exit 1
fi
