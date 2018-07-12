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
  expect(field.getErr()).toBeUndefined();

  // Toggle required to true
  field.set({ required: true });
  field.validate();
  expect(field.getErr()).toEqual('required');
  field.setValue('foo');
  field.clearErr();
  field.validate();
  expect(field.getErr()).toEqual(null);
});

it('should set defaults', () => {
  const field = new Field();
  expect(
    field.get([
      'required',
      'fullWidth',
      'hidden',
      'block',
      'disabled',
      'editable',
      'in',
      'out'
    ])
  ).toEqual({
    required: false,
    fullWidth: false,
    hidden: false,
    block: true,
    disabled: false,
    editable: true,
    in: true,
    out: true
  });
});

it('should set dirty when value changes', () => {
  // Dirties as value changes
  const field = new Field();
  expect(field.get('dirty')).toEqual(undefined);
  field.setValue('foo');
  expect(field.get('dirty')).toEqual(true);

  // Does not dirty as value isn't changing
  field.set({ dirty: false });
  field.setValue('foo');
  expect(field.get('dirty')).toEqual(false);

  // Dirties as value changes
  field.setValue('bar');
  expect(field.get('dirty')).toEqual(true);
});
