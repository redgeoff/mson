export default {
  name: 'RecoverPasswordEditor',
  component: 'RecoverPassword',

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
      component: 'ButtonField',
      type: 'submit',
      name: 'reset',
      label: 'Reset',
      icon: 'LockOpen'
    },
    {
      component: 'ButtonField',
      name: 'cancel',
      label: 'Cancel',
      icon: 'Cancel'
    }
  ],

  listeners: [
    {
      event: 'reset',
      actions: [
        {
          component: 'UpsertDoc',
          store: '{{store}}'
        },
        {
          component: 'Snackbar',
          message: 'Please expect an email shortly'
        },
        {
          component: 'Redirect',
          path: '/'
        }
      ]
    },
    {
      event: 'cancel',
      actions: [
        {
          component: 'Redirect',
          path: '/'
        }
      ]
    }
  ]
};
