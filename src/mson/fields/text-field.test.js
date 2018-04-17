import TextField from './text-field';
import fieldTester from './field-tester';
import Form from '../form';
import builder from '../builder';

fieldTester.shouldAll({ Field: TextField, exampleValue: 'foo' });

it('should validate max length', () => {
  const field = new TextField({
    maxLength: 5
  });

  field.setValue('12345');
  field.validate();
  expect(field.get('err')).toEqual(null);

  field.setValue('123456');
  field.validate();
  expect(field.get('err')).toEqual('5 characters or less');
});

it('should validate min length', () => {
  const field = new TextField({
    minLength: 5
  });

  field.setValue('12345');
  field.validate();
  expect(field.get('err')).toEqual(null);

  field.setValue('1234');
  field.validate();
  expect(field.get('err')).toEqual('5 characters or more');
});

it('should report bad types', () => {
  const field = new TextField();

  const validValues = ['Valid string', null];

  validValues.forEach(value => {
    field.setValue(value);
    field.validate();
    expect(field.hasErr()).toEqual(false);
  });

  const invalidValues = [
    {
      foo: 'must not be object'
    },
    ['must not be array'],
    false,
    1,
    1.0
  ];

  invalidValues.forEach(value => {
    field.setValue(value);
    field.validate();
    expect(field.hasErr()).toEqual(true);
    expect(field.getErr()).toEqual('must be a string');
  });
});

it('should get schema form', () => {
  const field = new TextField();
  const schemaForm = new Form();
  field.buildSchemaForm(schemaForm, builder);

  schemaForm.setValues({
    name: 'myField',
    maxLength: 10
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(false);

  schemaForm.setValues({
    name: 'myField',
    badParam: 10
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(true);
  expect(schemaForm.getErrs()).toEqual([
    {
      field: 'badParam',
      error: 'undefined field'
    }
  ]);
});
