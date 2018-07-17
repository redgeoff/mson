export default {
  name: 'UserList',
  component: 'FormsField',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'baseForm',
        component: 'Field',
        required: true
      },
      {
        name: 'storeName',
        component: 'TextField'
      }
    ]
  },
  form: {
    component: '{{baseForm}}',
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
    storeName: '{{storeName}}'
  }
};
