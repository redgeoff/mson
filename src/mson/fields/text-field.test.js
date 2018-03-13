import TextField from './text-field';
import fieldTester from './field-tester';

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
