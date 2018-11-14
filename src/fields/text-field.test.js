import TextField from './text-field';
import fieldTester from './field-tester';
import Form from '../form';
import compiler from '../compiler';
import testUtils from '../test-utils';

fieldTester.shouldAll({ Field: TextField, exampleValue: 'foo' });

it('should validate max length', () => {
  const field = new TextField({
    maxLength: 5
  });

  field.setValue('12345');
  field.validate();
  expect(field.get('err')).toBeUndefined();

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
  expect(field.get('err')).toBeUndefined();

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
  field.buildSchemaForm(schemaForm, compiler);

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

it('should support an invalid reg exp', () => {
  const field = new TextField();
  field.set({ invalidRegExp: '/^red|blue$/' });

  testUtils.expectValuesToBeValid(field, ['green', 'foo', '', null, 'blue1']);

  testUtils.expectValuesToBeInvalid(field, ['red', 'blue'], 'invalid');
});

it('should format mask', () => {
  const field = new TextField();

  field.set({
    mask: ['(', '/A/i']
  });

  expect(field.get('mask')).toEqual(['(', /A/i]);

  field.set({
    mask: '(.)'
  });

  expect(field.get('mask')).toEqual(['(', /./, ')']);
});

it('should format display value using mask', () => {
  const field = new TextField({ value: '5551234444' });

  expect(field.getValue()).toEqual('5551234444');
  expect(field.getDisplayValue()).toEqual('5551234444');

  field.set({
    mask: [
      '(',
      /[1-9]/,
      /\d/,
      /\d/,
      ')',
      ' ',
      /\d/,
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
      /\d/,
      /\d/
    ]
  });

  expect(field.getValue()).toEqual('5551234444');
  expect(field.getDisplayValue()).toEqual('(555) 123-4444');
});

it('should unmask value', () => {
  const field = new TextField();

  expect(field.toUnmaskedValue(null)).toEqual(null);
  expect(field.toUnmaskedValue('1,000.10')).toEqual('1,000.10');

  field.set({
    unmask: '/[^\\d\\.]/g'
  });

  expect(field.toUnmaskedValue('1,000.10')).toEqual('1000.10');
});

it('should get UI value', () => {
  const field = new TextField();
  expect(field.getUIValue()).toEqual('');

  field.setValue('foo');
  expect(field.getUIValue()).toEqual('foo');

  field.setValue(1);
  expect(field.getUIValue()).toEqual('1');
});

it('should detect if blank', () => {
  const field = new TextField();
  expect(field.isBlank()).toEqual(true);

  field.setValue(null);
  expect(field.isBlank()).toEqual(true);

  field.setValue(undefined);
  expect(field.isBlank()).toEqual(true);

  field.setValue('');
  expect(field.isBlank()).toEqual(true);

  field.setValue('foo');
  expect(field.isBlank()).toEqual(false);
});

it('should validate with validators', () => {
  const field = new TextField({
    validators: [
      {
        where: {
          value: 'foo'
        },
        error: 'invalid'
      },
      {
        where: {
          length: {
            $gt: 10
          }
        },
        error: 'too long'
      },
      {
        where: {
          words: {
            $gt: 3
          }
        },
        error: 'too many words'
      }
    ]
  });

  field.validate();
  expect(field.hasErr()).toEqual(false);

  field.setValue('good value');
  field.validate();
  expect(field.hasErr()).toEqual(false);

  field.setValue('foo');
  field.validate();
  expect(field.getErr()).toEqual('invalid');

  field.setValue('fooly foo foo');
  field.validate();
  expect(field.getErr()).toEqual('too long');

  field.setValue('1 2 3 4');
  field.validate();
  expect(field.getErr()).toEqual('too many words');
});
