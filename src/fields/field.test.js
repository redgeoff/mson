import testUtils from '../test-utils';
import Field from './field';
import Form from '../form';
import compiler from '../compiler';

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

// Note: we explicitly set a timeout on the following test to ensure that it doesn't take too long
// to compile components, particularly because the field schema is for a relatively long form. Once
// upon a time, inefficiencies in cloning data lead to extreme latency when compiling.
const VALIDATE_TIMEOUT_MS = 1;
it(
  'should validate schema',
  () => {
    const field = new Field();

    const schemaForm = new Form();
    field.buildSchemaForm(schemaForm, compiler);

    schemaForm.setValues({
      name: 'myField',
      label: 'My Field',
      required: true
      // TODO: ...
    });
    schemaForm.validate();
    expect(schemaForm.hasErr()).toEqual(false);

    schemaForm.setValues({
      name: 'myField',
      foo: 'bar'
    });
    schemaForm.validate();
    expect(schemaForm.hasErr()).toEqual(true);
    expect(schemaForm.getErrs()).toEqual([
      {
        field: 'foo',
        error: 'undefined field'
      }
    ]);
  },
  VALIDATE_TIMEOUT_MS
);

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

const NUM_FIELDS = 300;

const CREATE_FIELDS_TIMEOUT_MS = 400;
it('should create many fields quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    for (let i = 0; i < NUM_FIELDS; i++) {
      new Field();
    }
  }, CREATE_FIELDS_TIMEOUT_MS);
});

const CLONE_FIELDS_TIMEOUT_MS = 600;
it('should clone many fields quickly', () => {
  return testUtils.expectToFinishBefore(async () => {
    const field = new Field();
    for (let i = 0; i < NUM_FIELDS; i++) {
      field.clone();
    }
  }, CLONE_FIELDS_TIMEOUT_MS);
});

it('should identify as field', () => {
  const field = new Field();
  expect(field._isField()).toEqual(true);
});
