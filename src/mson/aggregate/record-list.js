export default {
  component: 'Form',
  props: ['baseForm', 'label', 'storeType'],
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
        name: 'storeType',
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
        type: '{{storeType}}'
      }
    }
  ]
};
