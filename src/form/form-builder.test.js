import FormBuilder from './form-builder';

it('should should sanity test', () => {
  const builder = new FormBuilder();
  builder.set({
    'fields.form.value': {
      component: 'Form',
      fields: [
        {
          name: 'firstName',
          component: 'TextField',
          label: 'First Name'
        }
      ]
    }
  });
});
