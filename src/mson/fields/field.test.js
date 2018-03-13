import Field from './field';

// TODO: create test suite that is applied to all fields

it('should toggle required', () => {
  // Start out required
  let field = new Field({ required: true });

  // Ensure value is required
  field.validate();
  expect(field.getErr()).toEqual('required');
  field.setValue('foo');
  field.clearErr();
  field.validate();
  expect(field.getErr()).toEqual(null);

  // Toggle required to false
  field.set({ required: false });
  field.validate();
  expect(field.getErr()).toEqual(null);

  // Start out as required false
  field = new Field();

  // Ensure not required
  field.validate();
  expect(field.getErr()).toEqual(null);

  // Toggle required to true
  field.set({ required: true });
  field.validate();
  expect(field.getErr()).toEqual('required');
  field.setValue('foo');
  field.clearErr();
  field.validate();
  expect(field.getErr()).toEqual(null);
});
