#!/usr/bin/env bash

if [ $(wc -c < build/static/js/main.*.js) -gt 800000 ]; then
  echo 'Error: Bundle too large!'
  exit 1
fi
