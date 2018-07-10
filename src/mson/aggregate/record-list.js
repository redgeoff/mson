export default {
  component: 'Form',
  fields: [
    {
      name: '{{name}}',
      label: '{{label}}',
      component: 'FormsField',
      form: {
        component: '{{baseForm}}'
      },
      store: {
        component: 'RecordStore',
        type: '{{storeType}}'
      }
    }
  ]
};
