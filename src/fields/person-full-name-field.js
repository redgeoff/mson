export default {
  component: 'CompositeField',
  schema: {
    component: 'Form',
    fields: [
      {
        // Hide from docs as label doesn't apply
        name: 'label',
        docLevel: null
      }
    ]
  },
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      component: 'PersonNameField',
      block: false
    },
    {
      name: 'lastName',
      label: 'Last Name',
      component: 'PersonNameField'
    }
  ]
};
