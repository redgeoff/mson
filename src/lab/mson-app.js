import compiler from '../mson/compiler';

compiler.registerComponent('app.Login', {
  component: 'Form',
  fields: [
    {
      component: 'EmailField',
      name: 'email',
      label: 'Email',
      required: true,
      fullWidth: true
    },
    {
      component: 'PasswordField',
      name: 'password',
      label: 'Password',
      required: true,
      fullWidth: true
    },
    {
      component: 'ButtonField',
      name: 'submit',
      label: 'Log In',
      type: 'submit',
      variant: 'outlined'
    },
    {
      component: 'ButtonField',
      name: 'createAccount',
      label: 'Create account'
    },
    {
      component: 'ButtonField',
      name: 'forgotPassword',
      label: 'Forgot password?'
    }
  ],
  listeners: [
    {
      event: 'createAccount',
      actions: [
        {
          component: 'Redirect',
          path: '/foo/signup'
        }
      ]
    }
  ]
});

compiler.registerComponent('app.UserSignup', {
  component: 'User',
  fields: [
    {
      component: 'PersonNameField',
      name: 'name',
      label: 'Name',
      required: true,
      before: 'username'
    },
    {
      component: 'PasswordField',
      name: 'password',
      label: 'Password',
      required: true,
      block: false
    },
    {
      component: 'PasswordField',
      name: 'retypePassword',
      label: 'Retype Password',
      required: true,
      out: false
    },
    {
      component: 'ButtonField',
      name: 'submit',
      label: 'Create account',
      type: 'submit',
      variant: 'outlined'
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
  ],
  listeners: [
    {
      event: 'submit',
      actions: [
        {
          component: 'CreateRecord',
          type: 'app.User'
        }
      ]
    }
  ]
});

compiler.registerComponent('app.Employee', {
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

compiler.registerComponent('app.Account', {
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

// compiler.registerComponent('app.ChangePassword', {
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
compiler.registerComponent('app.ChangePasswordForm', {
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

compiler.registerComponent('app.ChangePassword', {
  component: 'RecordEditor',
  baseForm: 'app.ChangePasswordForm',
  label: 'Password',
  url: 'api.mson.co',
  object: 'User',
  inFields: [],
  outFields: ['id', 'password'],
  id: '1' // TODO: '{{globals.user.id}}'
});

// TODO: should be able to define this in ViewAccount if wanted
compiler.registerComponent('app.ViewAccountForm', {
  name: 'app.ViewAccountForm',
  component: 'app.Account',
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

compiler.registerComponent('app.ViewAccount', {
  component: 'app.ViewAccountForm',
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

compiler.registerComponent('app.EditAccount', {
  component: 'RecordEditor',
  baseForm: 'app.Account',
  label: 'Account',
  url: 'api.mson.co',
  object: 'User',
  id: '1', // TODO: '{{globals.user.id}}'
  saveURL: '/account/view',
  cancelURL: '/account/view'
});

compiler.registerComponent('app.ViewAndEditAccount', {
  component: 'RecordEditorWithPreview',
  baseForm: 'app.Account',
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
            component: 'app.Employee'
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
          component: 'app.ViewAndEditAccount'
        }
      },
      {
        path: '/account/view',
        label: 'View Account',
        content: {
          component: 'app.ViewAccount'
        }
      },
      {
        path: '/account/edit',
        label: 'Edit Account',
        content: {
          component: 'app.EditAccount'
        }
      },
      {
        path: '/account/change-password',
        label: 'Change Password',
        content: {
          component: 'app.ChangePassword'
        }
      }
    ]
  },
  {
    path: '/foo',
    label: 'Another Section',
    items: [
      {
        path: '/foo/login',
        label: 'Login',
        content: {
          component: 'Card',
          title: 'Login',
          content: {
            component: 'app.Login'
          }
        },
        fullScreen: true
      },
      {
        path: '/foo/signup',
        label: 'Signup',
        content: {
          component: 'Card',
          title: 'Signup',
          content: {
            component: 'app.UserSignup'
          }
        },
        fullScreen: true
      },
      {
        path: '/foo/account',
        label: 'Account',
        content: {
          component: 'app.ViewAndEditAccount'
        }
      },
      {
        path: '/foo/view',
        label: 'View Account',
        content: {
          component: 'app.ViewAccount'
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
