export default {
  name: 'UserList',
  component: 'CollectionField',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'baseFormFactory',
        component: 'Field',
        required: true
      },
      {
        // Not required as baseFormFactory will populate formFactory
        name: 'formFactory',
        required: false
      }
    ]
  },
  hideLabel: true,
  formFactory: {
    component: 'Factory',
    product: '{{baseFormFactory}}',
    properties: {
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
              name: 'component',
              value: {
                'fields.password.hidden': false,
                'fields.password.required': true,
                'fields.password.out': true
              }
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
              name: 'component',
              value: {
                'fields.password.hidden': false,
                'fields.password.required': true,
                'fields.password.out': true,

                // Clear any previous value set when changing the password
                'fields.password.value': null
              }
            },
            {
              component: 'Set',
              name: 'pristine',
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
    }
  }
};
