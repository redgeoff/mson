export default {
  name: 'UserList',
  component: 'FormsField',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'baseFormFactory',
        component: 'Field',
        required: true
      },
      {
        name: 'storeName',
        component: 'TextField'
      }
    ]
  },
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
              // Clear any previous value set when changing the password
              component: 'Set',
              name: 'fields.password.value',
              value: null
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
      ]
    },
    access: {
      fields: {
        setPassword: {
          read: 'admin'
        }
      }
    }
  }
};
