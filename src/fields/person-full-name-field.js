export default {
  component: 'CompositeField',
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
