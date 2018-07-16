export default {
  component: 'Form',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'baseForm',
        component: 'Field',
        required: true
      },
      {
        name: 'label',
        component: 'TextField',
        required: true
      },
      {
        name: 'storeName',
        component: 'TextField'
      }
    ]
  },
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
        type: '{{storeName}}'
      }
    }
  ]
};
