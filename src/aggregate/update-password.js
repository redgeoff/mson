export default {
  name: 'UpdatePassword',
  component: 'Form',
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
          name: 'component',
          value: {
            'fields.password.hidden': false,
            'fields.password.out': true,
            'fields.password.required': true,
            'fields.retypePassword.hidden': false
          }
        }
      ]
    }
  ]
};
