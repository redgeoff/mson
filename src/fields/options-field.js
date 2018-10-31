export default {
  component: 'CollectionField',
  label: 'Options',
  forbidOrder: false,
  formFactory: {
    component: 'Factory',
    product: {
      component: 'Form',
      fields: [
        {
          name: 'label',
          label: 'Label',
          component: 'TextField',
          required: true,
          block: false
        },
        {
          name: 'value',
          label: 'Value',
          component: 'TextField',
          required: true
        }
      ]
    }
  }
};
