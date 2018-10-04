import PhoneField from './phone-field';
import fieldTester from './field-tester';
import testUtils from '../test-utils';

fieldTester.shouldAll({ Field: PhoneField, exampleValue: '(646) 123-4567' });

it('should validate', () => {
  const field = new PhoneField();

  testUtils.expectValuesToBeValid(field, [
    '(646) 123-4567',
    '6461234567',
    '+1 (646) 123-4567',
    '+44 1234 567890',
    '+441234567890',
    '+245-1-234567',
    null
  ]);

  testUtils.expectValuesToBeInvalid(
    field,
    [
      '(646) 123-456',
      '646123456',
      '+44 1234 56789',
      '+44123456789',
      '646123456A',
      '+999'
    ],
    'invalid'
  );
});

it('should format default mask', () => {
  const field = new PhoneField();

  field.set({
    defaultMask: '(.)'
  });

  expect(field.get('defaultMask')).toEqual(['(', /\d/, ')']);
});

it('should format value', () => {
  const field = new PhoneField({ value: '5551234444' });
  expect(field.getValue()).toEqual('(555) 123-4444');
  expect(field.getDisplayValue()).toEqual('(555) 123-4444');

  field.setValue('(555) 123-4444');
  expect(field.getValue()).toEqual('(555) 123-4444');
  expect(field.getDisplayValue()).toEqual('(555) 123-4444');

  field.setValue('+44 1234 567890');
  expect(field.getValue()).toEqual('+44 1234 567890');
  expect(field.getDisplayValue()).toEqual('+44 1234 567890');

  field.setValue('+441234567890');
  expect(field.getValue()).toEqual('+44 1234 567890');
  expect(field.getDisplayValue()).toEqual('+44 1234 567890');

  field.setValue('(646] 123-4567');
  expect(field.getValue()).toEqual('(646) 123-4567');
  expect(field.getDisplayValue()).toEqual('(646) 123-4567');
});

it('should check if conforms to mask', () => {
  const field = new PhoneField();
  expect(
    field._conformsToMask('(646) 123-4567', field.get('defaultMask'))
  ).toEqual(true);
  expect(
    field._conformsToMask('(646] 123-4567', field.get('defaultMask'))
  ).toEqual(false);
  expect(
    field._conformsToMask('(646) 123-456A', field.get('defaultMask'))
  ).toEqual(false);
});
