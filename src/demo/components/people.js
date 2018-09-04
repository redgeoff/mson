export default {
  name: 'app.People',
  component: 'Form',
  fields: [
    {
      component: 'FormsField',
      name: 'formsField',
      label: 'Records',
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
          }
        ]
      }
    }
  ]
};
