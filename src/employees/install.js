#!/usr/bin/env node

import client from './client';
import config from './config.json';
import { reCAPTCHAProperties } from './server-properties';
import * as components from '../employees/components';

const seed = async () => {
  const development = await client.record.create({
    appId: config.appId,
    componentName: 'app.Department',
    fieldValues: {
      name: 'Development',
      privateNotes: 'Development notes only visible to managers'
    }
  });

  const sales = await client.record.create({
    appId: config.appId,
    componentName: 'app.Department',
    fieldValues: {
      name: 'Sales',
      privateNotes: 'Sales notes only visible to managers'
    }
  });

  const N = 100;
  for (let i = 1; i <= N; i++) {
    let departments = null;
    const r = Math.random();
    if (r < 0.6) {
      departments = [development.data.createRecord.id];
    } else if (r < 0.9) {
      departments = [sales.data.createRecord.id];
    } else {
      departments = [
        development.data.createRecord.id,
        sales.data.createRecord.id
      ];
    }

    await client.record.create({
      appId: config.appId,
      componentName: 'app.Employee',
      fieldValues: {
        firstName: 'First' + i,
        lastName: 'Last' + i,
        username: 'test' + i + '@example.com',
        password: 'secret123',
        departments
      }
    });
  }
};

const main = async () => {
  await client.user.logIn({
    username: config.superuser.username,
    password: config.superuser.password
  });

  await client.app.create({ name: 'employees' });

  for (let i in components) {
    await client.component.create({
      appId: config.appId,
      definition: components[i]
    });
  }

  await client.component.create({
    appId: config.appId,
    definition: reCAPTCHAProperties
  });

  // Create default admin user
  await client.record.create({
    appId: config.appId,
    componentName: 'app.Employee',
    fieldValues: {
      firstName: 'AdminFirst',
      lastName: 'AdminLast',
      username: 'admin@example.com',
      password: 'admin123',
      roles: ['admin']
    }
  });

  await seed();
};

main();
