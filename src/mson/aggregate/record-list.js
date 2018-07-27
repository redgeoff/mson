export default {
  name: 'RecordList',
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
        component: 'Form',
        componentToWrap: '{{baseForm}}'
      },
      store: {
        component: 'RecordStore',
        storeName: '{{storeName}}'
      }
    }
  ]
};
