import SelectField from './select-field';
import fieldTester from './field-tester';
import testUtils from '../test-utils';

const colors = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' }
];

fieldTester.shouldAll({
  Field: SelectField,
  props: { options: colors },
  exampleValue: 'red'
});

const createField = () => {
  return new SelectField({ options: colors });
};

it('should get null when blank string selected', () => {
  const field = createField();
  field.setValue('green');

  // Simulate user selecting blank string
  field.setValue('');
  expect(field.getValue()).toEqual(null);
});

it('should get display value', () => {
  const field = createField();

  field.setValue('green');
  expect(field.getDisplayValue()).toEqual('Green');
  field.clearValue();
  expect(field.getDisplayValue()).toEqual(null);

  field.set({ multiple: true });
  field.setValue(['green']);
  expect(field.getDisplayValue()).toEqual(['Green']);
  field.setValue(['red', 'green']);
  expect(field.getDisplayValue()).toEqual(['Red', 'Green']);
  field.clearValue();
  expect(field.getDisplayValue()).toEqual(null);
});

it('should ensure in list', () => {
  const field = createField();

  field.setValue('orange');
  field.validate();
  expect(field.getErr()).toEqual([
    {
      error: 'orange is not an option'
    }
  ]);

  field.set({ multiple: true });
  field.setValue(['yellow', 'purple']);
  field.validate();
  expect(field.getErr()).toEqual([
    {
      error: 'yellow is not an option'
    },
    {
      error: 'purple is not an option'
    }
  ]);
});

it('should validate with multiple-value-field', () => {
  const field = createField();
  field.set({ maxSize: 1, multiple: true });
  field.setValue(['red', 'green']);
  field.validate();
  expect(field.getErr()).toEqual([{ error: '1 or less' }]);
});

it('should validate', () => {
  const field = createField();

  testUtils.expectValuesToBeValid(field, ['green', '', null]);
  testUtils.expectValuesToBeInvalid(field, [[], 'orange']);

  field.set({ multiple: true });
  testUtils.expectValuesToBeValid(field, [
    ['green'],
    [],
    ['red', 'green'],
    null
  ]);
  testUtils.expectValuesToBeInvalid(field, [
    [''],
    [null],
    ['red', null],
    ['red', ''],
    ['orange'],
    ['purple', 'red']
  ]);
});
