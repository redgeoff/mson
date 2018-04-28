import TextField from './text-field';
import fieldTester from './field-tester';
import Form from '../form';
import builder from '../builder';
import testUtils from '../test-utils';

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

  testUtils.expectValuesToBeValid(field, ['Valid string', null]);

  testUtils.expectValuesToBeInvalid(
    field,
    [
      {
        foo: 'must not be object'
      },
      ['must not be array'],
      false,
      1,
      1.0
    ],
    'must be a string'
  );
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
