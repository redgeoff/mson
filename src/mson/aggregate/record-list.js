export default {
  name: 'RecordList',
  component: 'Form',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'baseFormFactory',
        component: 'Field',
        required: true
      },
      {
        name: 'label',
        component: 'TextField',
        required: true
      },
      {
        name: 'store',
        component: 'Field'
      }
    ]
  },
  fields: [
    {
      name: '{{name}}',
      label: '{{label}}',
      component: 'CollectionField',
      hideLabel: true,
      formFactory: {
        component: 'Factory',
        product: '{{baseFormFactory}}'
      },
      store: '{{store}}'
    }
  ]
};
