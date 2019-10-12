export default {
  name: 'ComponentForm',
  component: 'Form',
  fields: [
    {
      component: 'TextField',
      name: 'name',
      label: 'Name',
      required: true,
      maxLength: 60
    },
    {
      component: 'TextField',
      name: 'definition',
      label: 'Definition',
      required: true
    }
  ],
  access: {
    form: {
      create: 'admin',
      read: 'admin',
      update: 'admin',
      archive: 'admin'
    }
  }
};
