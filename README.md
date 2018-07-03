# mson

## Setup

  - Let DIR equal a directory of your choosing
  - $ cd DIR
  - $ git clone https://github.com/redgeoff/node-vagrant
  - $ cd node-vagrant
  - $ cd app
  - $ git clone https://bitbucket.org/redgeoff/mson
  - $ git clone https://bitbucket.org/redgeoff/mson-server
  - $ vagrant up
  - $ vagrant ssh
  - $ cd mson-server
  - $ yarn install
  - $ yarn compile
  - $ yarn install-mson
  - $ cd ../mson
  - $ yarn install
  - $ yarn setup # Note: this needs to be run after any future `yarn install`

## Running

In 1st terminal:
  - $ cd DIR/node-vagrant/app/mson-server
  - $ yarn start

In 2nd terminal:
  - $ cd DIR/node-vagrant/app/mson
  - $ yarn start

In browser:
  - Visit http://192.168.50.11:3000
