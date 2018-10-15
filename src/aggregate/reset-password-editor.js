export default {
  name: 'ResetPasswordEditor',
  component: 'Form',

  schema: {
    component: 'Form',
    fields: [
      {
        name: 'store',
        component: 'Field'
      }
    ]
  },

  fields: [
    {
      component: 'TextField',
      name: 'token',
      label: 'Token',
      hidden: true
    },
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
    },
    {
      component: 'ButtonField',
      type: 'submit',
      name: 'reset',
      label: 'Reset',
      icon: 'Send'
    }
  ],

  validators: [
    {
      where: {
        fields: {
          retypePassword: {
            value: {
              $ne: '{{fields.password.value}}'
            }
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
      event: 'createRecord',
      actions: [
        {
          component: 'ResetPassword',
          token: '{{fields.token.value}}'
        }
      ]
    },
    {
      event: 'reset',
      actions: [
        {
          component: 'Set',
          name: 'fields.token.value',
          value: '{{globals.route.parameters.token}}'
        },
        {
          component: 'UpsertDoc',
          store: '{{store}}'
        },
        {
          component: 'Snackbar',
          message: 'Password updated'
        },
        {
          component: 'Redirect',
          path: '/'
        }
      ]
    }
  ]
};
