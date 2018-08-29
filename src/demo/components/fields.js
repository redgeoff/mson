export default {
  name: 'app.Fields',
  component: 'Form',
  fields: [
    {
      name: 'textField',
      component: 'TextField',
      label: 'TextField',
      required: true
    },
    {
      name: 'buttonField',
      component: 'ButtonField',
      label: 'Submit',
      icon: 'Save',
      type: 'submit'
    }
  ]
};
