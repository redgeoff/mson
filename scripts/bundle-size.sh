#!/usr/bin/env bash

mainMaxBytes=250000
chunkMaxBytes=850000

if [ $(wc -c < build/static/js/main.*.js) -gt ${mainMaxBytes} ]; then
  echo 'Error: main bundle too large!'
  exit 1
fi

if [ $(wc -c < build/static/js/1.*.chunk.js) -gt ${chunkMaxBytes} ]; then
  echo 'Error: chunk bundle too large!'
  exit 1
fi
