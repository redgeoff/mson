import compiler from '../mson/compiler';

compiler.registerComponent('org.proj.Employee', {
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
});

compiler.registerComponent('org.proj.Account', {
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
    // {
    //   component: 'ButtonField',
    //   name: 'submit',
    //   label: 'Save',
    //   type: 'submit'
    // },
    // {
    //   component: 'ButtonField',
    //   name: 'cancel',
    //   label: 'Cancel'
    // }
  ]
});

// compiler.registerComponent('org.proj.ChangePassword', {
//   component: 'RecordEditorOld',
//   form: {
//     component: 'Form',
//     fields: [
//       {
//         component: 'PasswordField',
//         name: 'password',
//         label: 'New Password',
//         required: true
//       },
//       {
//         component: 'PasswordField',
//         name: 'retypePassword',
//         label: 'Retype Password',
//         required: true
//       }
//     ],
//     validators: [
//       {
//         where: {
//           retypePassword: {
//             value: {
//               $ne: '{{password.value}}'
//             }
//           }
//         },
//         error: {
//           field: 'retypePassword',
//           error: 'must match'
//         }
//       }
//     ]
//   },
//   listeners: [
//     {
//       event: 'load',
//       actions: [
//         {
//           component: 'Set',
//           name: 'value',
//           value: {
//             id: '1' // TODO: '{{user.id}}'
//           }
//         },
//         {
//           component: 'Set',
//           name: 'pristine',
//           value: true
//         }
//       ]
//     },
//     {
//       event: 'save',
//       actions: [
//         {
//           component: 'APISet',
//           url: 'api.mson.co',
//           object: 'User',
//           id: '1', // TODO: '{{user.id}}'
//           fields: ['id', 'password']
//         },
//         {
//           // Needed or else will be prompted for save
//           component: 'Set',
//           name: 'pristine',
//           value: true
//         },
//         {
//           component: 'Redirect',
//           path: '/home'
//         },
//         {
//           component: 'Snackbar',
//           message: 'Password changed'
//         }
//       ]
//     },
//     {
//       event: 'cancel',
//       actions: [
//         {
//           component: 'Redirect',
//           path: '/home'
//         }
//       ]
//     }
//   ]
// });

// TODO: should be able to inline in ChangePassword
compiler.registerComponent('org.proj.ChangePasswordForm', {
  component: 'Form',
  fields: [
    {
      component: 'PasswordField',
      name: 'password',
      label: 'New Password',
      required: true
    },
    {
      component: 'PasswordField',
      name: 'retypePassword',
      label: 'Retype Password',
      required: true
    }
  ],
  validators: [
    {
      where: {
        retypePassword: {
          value: {
            $ne: '{{password.value}}'
          }
        }
      },
      error: {
        field: 'retypePassword',
        error: 'must match'
      }
    }
  ]
});

compiler.registerComponent('org.proj.ChangePassword', {
  component: 'RecordEditor',
  baseForm: 'org.proj.ChangePasswordForm',
  label: 'Password',
  url: 'api.mson.co',
  object: 'User',
  inFields: [],
  outFields: ['id', 'password'],
  id: '1' // TODO: '{{globals.user.id}}'
});

// TODO: should be able to define this in ViewAccount if wanted
compiler.registerComponent('org.proj.ViewAccountForm', {
  name: 'org.proj.ViewAccountForm',
  component: 'org.proj.Account',
  fields: [
    {
      component: 'ButtonField',
      name: 'edit',
      label: 'Edit',
      icon: 'ModeEdit'
    },
    {
      component: 'ButtonField',
      name: 'cancel',
      label: 'Cancel',
      icon: 'Cancel'
    }
  ]
});

compiler.registerComponent('org.proj.ViewAccount', {
  component: 'org.proj.ViewAccountForm',
  listeners: [
    {
      event: 'fields',
      actions: [
        {
          component: 'Set',
          name: 'editable',
          value: false
        }
      ]
    },
    {
      event: 'load',
      actions: [
        {
          component: 'APIGet',
          url: 'api.mson.co',
          object: 'User',
          id: '1' // TODO: '{{globals.user.id}}'
        },
        {
          component: 'Set',
          name: 'pristine',
          value: true
        }
      ]
    },
    {
      event: 'edit',
      actions: [
        {
          component: 'Redirect',
          path: '/account/edit'
        }
      ]
    },
    {
      event: 'cancel',
      actions: [
        {
          component: 'Redirect',
          path: '/home'
        }
      ]
    }
  ]
});

compiler.registerComponent('org.proj.EditAccount', {
  component: 'RecordEditor',
  baseForm: 'org.proj.Account',
  label: 'Account',
  url: 'api.mson.co',
  object: 'User',
  id: '1', // TODO: '{{globals.user.id}}'
  saveURL: '/account/view',
  cancelURL: '/account/view'
});

compiler.registerComponent('org.proj.ViewAndEditAccount', {
  component: 'RecordEditorWithPreview',
  baseForm: 'org.proj.Account',
  label: 'Account',
  url: 'api.mson.co',
  object: 'User',
  id: '1' // TODO: '{{globals.user.id}}'
});

const menuItems = [
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
            component: 'org.proj.Employee'
          }
        }
      ]
    }
  },
  {
    path: '',
    label: 'My Account',
    items: [
      {
        path: '/account',
        label: 'Account',
        content: {
          component: 'org.proj.ViewAndEditAccount'
        }
      },
      {
        path: '/account/view',
        label: 'View Account',
        content: {
          component: 'org.proj.ViewAccount'
        }
      },
      {
        path: '/account/edit',
        label: 'Edit Account',
        content: {
          component: 'org.proj.EditAccount'
        }
      },
      {
        path: '/account/change-password',
        label: 'Change Password',
        content: {
          component: 'org.proj.ChangePassword'
        }
      }
    ]
  },
  {
    path: '/foo',
    label: 'Another Section',
    items: [
      {
        path: '/foo/account',
        label: 'Account',
        content: {
          component: 'org.proj.ViewAndEditAccount'
        }
      },
      {
        path: '/foo/view',
        label: 'View Account',
        content: {
          component: 'org.proj.ViewAccount'
        }
      }
    ]
  }
];

const app = compiler.newComponent({
  component: 'App',
  menu: {
    component: 'Menu',
    items: menuItems
  }
});

// TODO: just temporary until we have a proper way to wire up to backend
// const account = app.get('menu').getItem('/account/edit').content.getStore();
// account.set({ id: '1', name: 'Nina Simone', email: 'nina@example.com' })
// const employees = app
//   .get('menu')
//   .getItem('/employees')
//   .content.getField('employees')
//   .getStore();
// employees.set({ id: '1', name: 'Ella Fitzgerald', email: 'ella@example.com' });
// employees.set({ id: '2', name: 'Frank Sinatra', email: 'frank@example.com' });
// employees.set({ id: '3', name: 'Ray Charles', email: 'ray@example.com' });
const employees = app
  .get('menu')
  .getItem('/employees')
  .content.getField('employees');
employees.addForm({
  id: '1',
  name: 'Ella Fitzgerald',
  email: 'ella@example.com'
});
employees.addForm({
  id: '2',
  name: 'Frank Sinatra',
  email: 'frank@example.com'
});
employees.addForm({ id: '3', name: 'Ray Charles', email: 'ray@example.com' });

export default app;
