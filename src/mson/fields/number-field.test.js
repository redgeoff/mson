import NumberField from './number-field';
import testUtils from '../test-utils';

it('should validate format', () => {
  const field = new NumberField();

  testUtils.expectValuesToBeValid(field, [
    '111',
    '111.11',
    '0.111',
    '-111',
    '-1234567890.1234567890',
    '+111',
    '0',
    '.1',
    '1.'
  ]);

  testUtils.expectValuesToBeInvalid(field, [
    'aaa111',
    '111aaa',
    '0.111aaa',
    'aaa0.111',
    '123-',
    '0.123-',
    '123+'
    // '+',
    // '0123'
  ]);
});

it('should validate lengths', () => {
  let field = new NumberField({ maxValue: 3 });
  testUtils.expectValuesToBeValid(field, ['-1', 2, '3', '3.0']);
  testUtils.expectValuesToBeInvalid(
    field,
    ['4', 10, '3.1'],
    'must be 3 or less'
  );

  field = new NumberField({ minValue: 3 });
  testUtils.expectValuesToBeValid(field, [3, 4, '3.0']);
  testUtils.expectValuesToBeInvalid(field, [2, 2.9], 'must be 3 or greater');

  field = new NumberField({ minValue: 3, maxValue: 4 });
  testUtils.expectValuesToBeValid(field, [3, 4, '3.2']);
  testUtils.expectValuesToBeInvalid(field, [2], 'must be 3 or greater');
  testUtils.expectValuesToBeInvalid(field, [5], 'must be 4 or less');
});
