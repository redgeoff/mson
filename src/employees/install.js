#!/usr/bin/env node

import client from './client';
import config from './config.json';
import { department, tmpEmployee } from './components';

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
  ],
  roles: ['employee'] // Just for testing
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

const seed = async () => {
  const developers = await client.record.create({
    appId: config.appId,
    componentName: 'app.Department',
    fieldValues: {
      name: 'Developers',
      employeeNotes: 'developers',
      adminNotes: 'developers'
    }
  });

  const N = 100;
  for (let i = 1; i <= N; i++) {
    await client.record.create({
      appId: config.appId,
      componentName: 'app.TmpEmployee',
      fieldValues: {
        firstName: 'First' + i,
        lastName: 'Last' + i,
        departments: [developers.data.createRecord.id]
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

  await client.component.create({ appId: config.appId, definition: user });

  await client.component.create({
    appId: config.appId,
    definition: department
  });

  await client.component.create({
    appId: config.appId,
    definition: tmpEmployee
  });

  // await client.component.create({ appId: config.appId, definition: employee });
  //
  // await client.component.create({ appId: config.appId, definition: menu });
  //
  // await client.component.create({ appId: config.appId, definition: app });

  await seed();
};

main();
