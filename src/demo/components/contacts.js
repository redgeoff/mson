export default {
  name: 'app.Contacts',
  component: 'Form',
  fields: [
    {
      component: 'FormsField',
      name: 'formsField',
      label: 'Contacts',
      help: 'Example help',
      required: true,
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
        component: 'MemoryStore'
      }
    }
  ]
};
