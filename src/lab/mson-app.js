import compiler from '../mson/compiler';
import globals from '../mson/globals';
import { department, tmpEmployee } from '../employees/components';

// TODO: in a production app the appId should be set by the path or subdomain
globals.set({ appId: 101 });

compiler.registerComponent('app.Login', {
  component: 'Form',
  fields: [
    {
      component: 'EmailField',
      name: 'username',
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
      event: 'submit',
      actions: [
        {
          component: 'LogInToApp'
        },
        // TODO: redirect to home based on menu def
        {
          component: 'Redirect',
          path: '/account/edit'
        }
      ]
    },
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
      name: 'firstName',
      label: 'First Name',
      required: true,
      before: 'username',
      block: false
    },
    {
      component: 'PersonNameField',
      name: 'lastName',
      label: 'Last Name',
      required: true,
      before: 'username'
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
      event: 'create',
      actions: [
        {
          component: 'Set',
          name: 'fields.username.out',
          value: true
        },
        {
          component: 'Set',
          name: 'fields.password.out',
          value: true
        },
        {
          component: 'Set',
          name: 'fields.password.block',
          value: false
        }
      ]
    },
    {
      event: 'submit',
      actions: [
        {
          component: 'CreateRecord',
          type: 'app.User'
        },
        {
          component: 'LogInToApp'
        },
        {
          component: 'Redirect',
          path: '/account/edit'
        }
      ]
    }
  ]
});

compiler.registerComponent('app.RemoveEmployee', {
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
    },
    {
      name: 'departments',
      label: 'Departments',
      component: 'SelectListField',
      blankString: 'None',
      options: [
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' }
      ]
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

// TODO: is there a good way for UserSignup to share this structure? app.Employee and app.UserSignup
// should probably inherit some shared component
compiler.registerComponent('app.Employee', {
  component: 'Form',
  fields: [
    {
      component: 'PersonNameField',
      name: 'firstName',
      label: 'First Name',
      required: true,
      block: false
    },
    {
      component: 'PersonNameField',
      name: 'lastName',
      label: 'Last Name',
      required: true
    }
    // TODO: will probably need to include username when getting list of users
    // {
    //   component: 'EmailField',
    //   name: 'email',
    //   label: 'Email',
    //   required: true
    // }
  ]
});

compiler.registerComponent('app.Employees', {
  component: 'Form',
  fields: [
    {
      name: 'employees',
      label: 'Employees',
      component: 'FormsField',
      form: {
        component: 'app.Employee'
      },
      listeners: [
        {
          event: 'load',
          actions: [
            {
              component: 'GetRecords',
              type: 'app.User'
            }
          ]
        }
      ]
    }
  ]
});

compiler.registerComponent('app.Department', department);

// TODO: should we also be able just specify the FormsField without the wrapping Form?
compiler.registerComponent('app.Departments', {
  component: 'Form',
  fields: [
    {
      name: 'departments',
      label: 'Departments',
      component: 'FormsField',
      form: {
        component: 'app.Department'
      },
      store: {
        component: 'RecordStore',
        type: 'app.Department'
      }
    }
  ]
});

compiler.registerComponent('app.TmpEmployee', tmpEmployee);

compiler.registerComponent('app.TmpEmployees', {
  component: 'Form',
  fields: [
    {
      name: 'tmpEmployees',
      label: 'Tmp Employees',
      component: 'FormsField',
      form: {
        component: 'app.TmpEmployee'
      },
      store: {
        component: 'RecordStore',
        type: 'app.TmpEmployee'
      }
    }
  ]
});

const menuItems = [
  {
    path: '/remove-employees',
    label: 'Remove Employees',
    content: {
      component: 'Form',
      fields: [
        {
          name: 'removeEmployees',
          label: 'Remove Employees',
          component: 'FormsField',
          form: {
            component: 'app.RemoveEmployee'
          }
        }
      ],
      resetOnLoad: false
    }
  },
  {
    path: '/employees',
    label: 'Employees',
    content: {
      component: 'app.Employees'
    }
  },
  {
    path: '/departments',
    label: 'Departments',
    content: {
      component: 'app.Departments'
    }
  },
  {
    path: '/tmp-employees',
    label: 'Tmp Employees',
    content: {
      component: 'app.TmpEmployees'
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
  },
  {
    path: '/logout',
    label: 'Logout',
    content: {
      component: 'Action',
      actions: [
        {
          component: 'LogOutOfApp'
        },
        {
          component: 'Redirect',
          path: '/foo/login'
        }
      ]
    }
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
//   .content.getField('removeEmployees')
//   .getStore();
// employees.set({ id: '1', name: 'Ella Fitzgerald', email: 'ella@example.com' });
// employees.set({ id: '2', name: 'Frank Sinatra', email: 'frank@example.com' });
// employees.set({ id: '3', name: 'Ray Charles', email: 'ray@example.com' });
const employees = app
  .get('menu')
  .getItem('/remove-employees')
  .content.getField('removeEmployees');
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
