import SelectField from './select-field';
import fieldTester from './field-tester';

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
});
