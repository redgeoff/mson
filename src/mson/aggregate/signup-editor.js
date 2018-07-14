export default {
  component: 'RecordEditor',
  props: ['signupBaseForm'],
  schema: {
    component: 'Form',
    field: [
      {
        name: 'signupBaseForm',
        component: 'Field',
        required: true
      }
    ]
  },
  preview: false,
  baseForm: {
    component: '{{signupBaseForm}}',
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
    ]
  },
  label: 'Signup',
  hideCancel: true,
  recordWhere: null,
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
          component: 'LogInToAppAndRedirect'
        }
      ]
    }
  ]
};
