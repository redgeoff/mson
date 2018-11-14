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

it('should not validate when ignoring errors', () => {
  const field = new Field({ required: true, ignoreErrs: true });
  field.validate();
  expect(field.hasErr()).toEqual(false);
});

it('should get display value', () => {
  const field = new Field();
  field.setValue('foo');
  expect(field.getDisplayValue()).toEqual('foo');
});

it('should get first error', () => {
  const field = new Field({ required: true });

  field.validate();
  expect(field.getFirstErr()).toEqual('required');

  field.set({ err: [{ error: '2nd layer' }] });
  expect(field.getFirstErr()).toEqual('2nd layer');

  field.set({ err: [{ error: [{ error: '3rd layer' }] }] });
  expect(field.getFirstErr()).toEqual('3rd layer');
});

it('should identify as field', () => {
  const field = new Field();
  expect(field.isField()).toEqual(true);
});

it('should validate with validators', () => {
  const field = new Field({
    validators: [
      {
        where: {
          value: 'foo'
        },
        error: 'invalid'
      }
    ]
  });

  field.validate();
  expect(field.hasErr()).toEqual(false);

  field.setValue('foo');
  field.validate();
  expect(field.getErr()).toEqual('invalid');
});
