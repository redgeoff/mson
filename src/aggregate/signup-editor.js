export default {
  name: 'SignupEditor',
  component: 'RecordEditor',
  preview: false,
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
  label: 'Signup',
  hideCancel: true,
  storeWhere: null,
  listeners: [
    {
      event: 'create',
      actions: [
        {
          component: 'Set',
          name: 'component',
          value: {
            'fields.username.out': true,
            'fields.password.hidden': false,
            'fields.password.out': true,
            'fields.password.block': false,
            'fields.roles.hidden': true,
            'fields.save.label': 'Create Account',
            'fields.save.icon': 'CheckCircle'
          }
        }
      ]
    },
    {
      event: 'didSave',
      actions: [
        {
          component: 'LogInToAppAndRedirect'
        }
      ]
    }
  ]
};
