#!/usr/bin/env node

import client from './client';
import config from './config.json';

const main = async () => {
  await client.user.logIn({
    username: config.superuser.username,
    password: config.superuser.password
  });
  await client.app.create({ name: 'employees' });
};

main();
