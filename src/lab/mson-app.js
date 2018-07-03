import compiler from '../mson/compiler';
import globals from '../mson/globals';
import { department, employee } from '../employees/components';

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
          path: '/account'
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

// TODO: should be able to inline in ChangePassword
compiler.registerComponent('app.ChangePasswordForm', {
  component: 'app.Employee',
  fields: [
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
  ],
  listeners: [
    {
      event: 'create',
      actions: [
        {
          component: 'Set',
          name: 'hidden',
          value: true
        },
        {
          component: 'Set',
          name: 'out',
          value: false
        },
        {
          component: 'Set',
          name: 'fields.password.hidden',
          value: false
        },
        {
          component: 'Set',
          name: 'fields.retypePassword.hidden',
          value: false
        },
        {
          component: 'Set',
          name: 'fields.password.required',
          value: true
        },
        {
          component: 'Set',
          name: 'fields.password.out',
          value: true
        }
      ]
    },
    {
      event: ['didSave', 'cancel'],
      actions: [
        {
          component: 'Redirect',
          path: '/account'
        }
      ]
    }
  ]
});

compiler.registerComponent('app.EmployeeSignupForm', {
  component: 'app.Employee',
  fields: [
    {
      component: 'PasswordField',
      name: 'retypePassword',
      label: 'Retype Password',
      required: true,
      out: false
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
          name: 'fields.password.hidden',
          value: false
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
        },
        {
          component: 'Set',
          name: 'fields.roles.hidden',
          value: true
        },
        {
          component: 'Set',
          name: 'fields.save.label',
          value: 'Create Account'
        },
        {
          component: 'Set',
          name: 'fields.save.icon',
          value: 'CheckCircle'
        }
      ]
    },
    {
      event: 'didSave',
      actions: [
        {
          component: 'LogInToApp'
        },
        {
          component: 'Redirect',
          path: '/account'
        }
      ]
    }
  ]
});

compiler.registerComponent('app.EmployeeSignup', {
  component: 'RecordEditor',
  preview: false,
  baseForm: 'app.EmployeeSignupForm',
  label: 'Signup',
  storeType: 'app.Employee',
  hideCancel: true,
  recordWhere: null
});

compiler.registerComponent('app.ChangePassword', {
  component: 'RecordEditor',
  preview: false,
  baseForm: 'app.ChangePasswordForm',
  label: 'Password',
  recordWhere: {
    userId: '{{globals.session.user.id}}'
  },
  storeType: 'app.Employee'
});

compiler.registerComponent('app.ViewAndEditAccount', {
  component: 'RecordEditor',
  baseForm: 'app.Employee',
  label: 'Account',
  recordWhere: {
    userId: '{{globals.session.user.id}}'
  },
  storeType: 'app.Employee',
  listeners: [
    {
      event: 'load',
      actions: [
        {
          component: 'GetRecords',
          type: 'app.Department'
        },
        {
          component: 'Iterator',
          iterator: 'arguments.edges',
          return: {
            value: '{{item.node.id}}',
            label: '{{item.node.fieldValues.name}}'
          }
        },
        {
          component: 'Set',
          name: 'fields.departments.options'
        }
      ]
    }
  ]
});

compiler.registerComponent('app.Employee', employee);

compiler.registerComponent('app.Employees', {
  component: 'Form',
  fields: [
    {
      name: 'employees',
      label: 'Employees',
      component: 'FormsField',
      form: {
        component: 'app.Employee',
        fields: [
          {
            component: 'ButtonField',
            name: 'setPassword',
            label: 'Set Password',
            hidden: true,
            icon: 'VpnKey'
          }
        ],
        listeners: [
          {
            event: 'didLoad',
            actions: [
              {
                component: 'Set',
                name: 'snapshot',
                value: 'take'
              }
            ]
          },
          {
            event: 'beginCreate',
            actions: [
              {
                component: 'Set',
                name: 'fields.password.hidden',
                value: false
              },
              {
                component: 'Set',
                name: 'fields.password.required',
                value: true
              },
              {
                component: 'Set',
                name: 'fields.password.out',
                value: true
              }
            ]
          },
          {
            event: 'endCreate',
            actions: [
              {
                component: 'Set',
                name: 'snapshot',
                value: 'restore'
              }
            ]
          },
          {
            event: 'beginRead',
            actions: [
              {
                component: 'Set',
                name: 'fields.setPassword.hidden',
                value: false
              }
            ]
          },
          {
            event: 'endRead',
            actions: [
              {
                component: 'Set',
                name: 'fields.setPassword.hidden',
                value: true
              }
            ]
          },
          {
            event: 'endUpdate',
            actions: [
              {
                component: 'Set',
                name: 'snapshot',
                value: 'restore'
              }
            ]
          },
          {
            event: 'setPassword',
            actions: [
              {
                component: 'Set',
                name: 'out',
                value: false
              },
              {
                component: 'Set',
                name: 'hidden',
                value: true
              },
              {
                component: 'Set',
                name: 'fields.password.hidden',
                value: false
              },
              {
                component: 'Set',
                name: 'fields.password.required',
                value: true
              },
              {
                component: 'Set',
                name: 'fields.password.out',
                value: true
              },
              {
                component: 'Set',
                name: 'parent.mode',
                value: 'update'
              }
            ]
          }
        ],
        access: {
          fields: {
            setPassword: {
              read: 'admin'
            }
          }
        }
      },
      store: {
        component: 'RecordStore',
        type: 'app.Employee'
      },
      listeners: [
        {
          event: 'load',
          actions: [
            {
              component: 'GetRecords',
              type: 'app.Department',
              where: {
                archivedAt: null
              }
            },
            {
              component: 'Iterator',
              iterator: 'arguments.edges',
              return: {
                value: '{{item.node.id}}',
                label: '{{item.node.fieldValues.name}}'
              }
            },
            {
              component: 'Set',
              name: 'form.fields.departments.options'
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

const menuItems = [
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
    label: 'Tmp',
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
            component: 'app.EmployeeSignup'
          }
        },
        fullScreen: true
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

export default app;
