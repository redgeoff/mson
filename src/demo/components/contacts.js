export default {
  name: 'app.Contacts',
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
      component: 'CollectionField',
      name: 'contacts',
      label: 'Contacts',
      hideLabel: true,
      // forbidCreate: true,
      // forbidUpdate: true,
      // forbidDelete: true,
      // forbidViewArchived: true,
      // forbidSearch: true,
      // forbidSort: true,
      formFactory: {
        component: 'Factory',
        product: {
          component: 'Form',
          fields: [
            {
              name: 'firstName',
              component: 'TextField',
              label: 'First Name',
              required: true,
              block: false
            },
            {
              name: 'lastName',
              component: 'TextField',
              label: 'Last Name'
            },
            {
              name: 'email',
              component: 'EmailField',
              label: 'Email'
            }
          ]
        }
      },
      store: '{{store}}'
    }
  ]
};
