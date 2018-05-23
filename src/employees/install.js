#!/usr/bin/env node

import client from './client';
import config from './config.json';

const user = {
  name: 'app.User',
  component: 'User',
  fields: [
    {
      component: 'PersonNameField',
      name: 'firstName',
      label: 'First Name',
      required: true
    },
    {
      component: 'PersonNameField',
      name: 'lastName',
      label: 'Last Name',
      required: true
    }
  ]
};

const department = {
  name: 'app.Department',
  component: 'Form',
  fields: [
    {
      component: 'PersonNameField',
      name: 'name',
      label: 'Name',
      required: true
    }
  ],
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
};

// const employee = {
//   name: 'app.Employee',
//   component: 'Form',
//   fields: [
//     {
//       component: 'TextField',
//       name: 'name',
//       label: 'Name',
//       required: true,
//       help: 'Enter a full name'
//     },
//     {
//       component: 'EmailField',
//       name: 'email',
//       label: 'Email',
//       required: true
//     }
//   ]
// };
//
// const menu = {
//   name: 'app.Menu',
//   component: 'Menu',
//   items: [
//     {
//       path: '/employees',
//       label: 'Employees',
//       content: {
//         component: 'Form',
//         fields: [
//           {
//             name: 'employees',
//             label: 'Employees',
//             component: 'FormsField',
//             form: {
//               component: 'app.Employee'
//             }
//           }
//         ]
//       }
//     }
//   ]
// };
//
// const app = {
//   name: 'app.App',
//   component: 'App',
//   menu: {
//     component: 'app.Menu'
//   }
// };

const main = async () => {
  await client.user.logIn({
    username: config.superuser.username,
    password: config.superuser.password
  });

  await client.app.create({ name: 'employees' });

  await client.component.create({ appId: config.appId, definition: user });

  await client.component.create({
    appId: config.appId,
    definition: department
  });

  // await client.component.create({ appId: config.appId, definition: employee });
  //
  // await client.component.create({ appId: config.appId, definition: menu });
  //
  // await client.component.create({ appId: config.appId, definition: app });
};

main();
