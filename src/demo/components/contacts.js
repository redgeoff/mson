export default {
  name: 'app.Contacts',
  component: 'Form',
  fields: [
    {
      component: 'FormsField',
      name: 'contacts',
      label: 'Contacts',
      // forbidCreate: true,
      // forbidUpdate: true,
      // forbidDestroy: true,
      // forbidViewArchived: true,
      // forbidSearch: true,
      // forbidSort: true,
      form: {
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
      },
      store: {
        component: 'LocalStorageStore'
      }
    }
  ]
};
