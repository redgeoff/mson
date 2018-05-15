#!/usr/bin/env node

import client from './client';
import config from './config.json';

const employee = {
  name: '1.Employee',
  component: 'Form',
  fields: [
    {
      component: 'TextField',
      name: 'name',
      label: 'Name',
      required: true,
      help: 'Enter a full name'
    },
    {
      component: 'EmailField',
      name: 'email',
      label: 'Email',
      required: true
    }
  ]
};

const menu = {
  name: '1.Menu',
  component: 'Menu',
  items: [
    {
      path: '/employees',
      label: 'Employees',
      content: {
        component: 'Form',
        fields: [
          {
            name: 'employees',
            label: 'Employees',
            component: 'FormsField',
            form: {
              component: '1.Employee'
            }
          }
        ]
      }
    }
  ]
};

const app = {
  name: '1.App',
  component: 'App',
  menu: {
    component: '1.Menu'
  }
};

const main = async () => {
  await client.user.logIn({
    username: config.superuser.username,
    password: config.superuser.password
  });

  // await client.app.create({ name: 'employees' });

  // await client.component.create({ appId: config.appId, definition: employee });

  // await client.component.create({ appId: config.appId, definition: menu });

  // await client.component.create({ appId: config.appId, definition: app });
};

main();
