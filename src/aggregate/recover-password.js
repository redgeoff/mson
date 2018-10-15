export default {
  name: 'RecoverPassword',
  component: 'Form',

  schema: {
    component: 'Form',
    fields: [
      {
        name: 'action',
        component: 'Field',
        label: 'Action'
      }
    ]
  },

  fields: [
    {
      name: 'email',
      component: 'EmailField',
      label: 'Email',
      required: true
    }
  ],

  listeners: [
    {
      event: 'createRecord',
      actions: [
        {
          component: 'RequestPasswordReset'
        },
        '{{action}}'
      ]
    }
  ]
};
