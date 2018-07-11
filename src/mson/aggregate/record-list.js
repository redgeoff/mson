export default {
  component: 'Form',
  props: ['label', 'baseForm', 'storeType'],
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
