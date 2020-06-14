import ComponentForm from './component-form';

it('should set definition', () => {
  const componentForm = new ComponentForm();

  // Handle null values
  componentForm.set({ 'fields.definition.value': null });

  const definition = {
    name: 'MyForm',
    component: 'Form',
    fields: [],
  };

  // Handle component
  componentForm.set({
    'fields.definition.value': definition,
  });
  expect(componentForm.get('fields.definition.value')).toEqual(definition);

  // Transform componentName
  componentForm.set({
    'fields.definition.value': {
      ...definition,
      componentName: 'Form',
      component: undefined,
    },
  });
  expect(componentForm.get('fields.definition.value')).toEqual(definition);
});
