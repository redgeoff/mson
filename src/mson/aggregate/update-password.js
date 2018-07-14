export default {
  component: 'Form',
  props: ['baseForm'],
  schema: {
    component: 'Form',
    field: [
      {
        name: 'baseForm',
        component: 'Field',
        required: true
      }
    ]
  },
  form: {
    component: '{{baseForm}}',
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
      }
    ]
  }
};
