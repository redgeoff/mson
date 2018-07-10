import compiler from '../mson/compiler';
import globals from '../mson/globals';
import { department, employee } from '../employees/components';

// TODO: in a production app the appId should be set by the path or subdomain
globals.set({ appId: 101 });

compiler.registerComponent('app.Login', {
  component: 'Login',
  listeners: [
    {
      event: 'createAccount',
      actions: [
        {
          component: 'Redirect',
          path: '/signup'
        }
      ]
    }
  ]
});

compiler.registerComponent('app.ChangePassword', {
  component: 'UpdatePasswordEditor',
  updatePasswordBaseForm: 'app.Employee',
  storeType: 'app.Employee',
  listeners: [
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

compiler.registerComponent('app.EmployeeSignup', {
  component: 'SignupEditor',
  signupBaseForm: 'app.Employee',
  storeType: 'app.Employee'
});

compiler.registerComponent('app.GetDepartments', {
  component: 'Action',
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
    }
  ]
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
          component: 'app.GetDepartments'
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
      component: 'UserList',
      baseForm: 'app.Employee',
      storeType: 'app.Employee',
      listeners: [
        {
          event: 'load',
          actions: [
            {
              component: 'app.GetDepartments'
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

compiler.registerComponent('app.Departments', {
  component: 'RecordList',
  name: 'departments',
  label: 'Departments',
  baseForm: 'app.Department',
  storeType: 'app.Department'
});

compiler.registerComponent('ResetPasswordEditor', {
  component: 'ResetPassword',
  fields: [
    {
      component: 'ReCAPTCHAField',
      siteKey: '6LdIbGMUAAAAAJnipR9t-SnWzCbn0ZX2myXBIauh'
    },
    {
      component: 'ButtonField',
      type: 'submit',
      name: 'reset',
      label: 'Reset'
    },
    {
      component: 'ButtonField',
      name: 'cancel',
      label: 'Cancel'
    }
  ],
  listeners: [
    {
      // TODO
      event: 'reset',
      actions: [
        {
          component: 'Redirect',
          path: '/'
        }
      ]
    }
  ]
});

const menuItems = [
  {
    path: '/employees',
    label: 'Employees',
    content: {
      component: 'app.Employees'
    },
    roles: ['admin', 'employee']
  },
  {
    path: '/departments',
    label: 'Departments',
    content: {
      component: 'app.Departments'
    },
    roles: ['manager']
  },
  {
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
    ],
    roles: ['admin', 'employee']
  },
  {
    path: '/',
    hidden: true,
    content: {
      component: 'Action',
      actions: [
        {
          if: {
            globals: {
              session: {
                user: {
                  roleNames: {
                    $in: ['admin', 'manager']
                  }
                }
              }
            }
          },
          component: 'Redirect',
          path: '/employees'
        },
        {
          if: {
            globals: {
              session: {
                user: {
                  roleNames: {
                    $nin: ['admin', 'manager']
                  }
                }
              }
            }
          },
          component: 'Redirect',
          path: '/account'
        }
      ]
    },
    items: [
      {
        path: '/login',
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
        path: '/signup',
        label: 'Signup',
        content: {
          component: 'Card',
          title: 'Signup',
          content: {
            component: 'app.EmployeeSignup'
          }
        },
        fullScreen: true
      },
      {
        path: '/resetPassword',
        content: {
          component: 'Card',
          title: 'Reset Password',
          content: {
            component: 'ResetPasswordEditor'
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
          path: '/login'
        }
      ]
    },
    roles: ['admin', 'employee']
  }
];

const app = compiler.newComponent({
  component: 'App',
  menu: {
    component: 'Menu',
    items: menuItems
  },
  listeners: [
    {
      event: 'loggedOut',
      actions: [
        {
          component: 'Redirect',
          path: '/login'
        }
      ]
    }
  ]
});

export default app;
