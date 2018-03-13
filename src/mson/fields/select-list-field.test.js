import SelectListField from './select-list-field';

const options = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' }
];

const createColors = (props) => {
  return new SelectListField({
    label: 'Colors',
    required: true,
    blankString: 'None',
    options,
    ...props
  });
};

it('should set and get', () => {
  const colors = createColors();

  expect(colors.getValue()).toBeFalsy();

  colors.setValue(['red', 'green', 'blue']);
  expect(colors.getValue()).toEqual(['red', 'green', 'blue']);

  colors.setValue(['red', 'blue']);
  expect(colors.getValue()).toEqual(['red', 'blue']);

  colors.clearValue();
  expect(colors.getValue()).toBeFalsy();
});

it('should set when items removed', () => {
  const colors = createColors();

  colors.setValue(['red', 'green', 'blue', 'green']);
  expect(colors.getValue()).toEqual(['red', 'green', 'blue', 'green']);

  colors._removeField(colors._fields.get(0));
  colors._removeField(colors._fields.get(2));
  expect(colors.getValue()).toEqual(['green', 'green']);

  colors.setValue(['red', 'green', 'blue', 'green']);
  expect(colors.getValue()).toEqual(['red', 'green', 'blue', 'green']);
});

it('should set label when removing first field', () => {
  const colors = createColors();

  colors.setValue(['red', 'green']);
  colors._removeField(colors._getField(0));
  expect(colors._fields.first().get('label')).toEqual('Colors');
});

it('should set options for next field', () => {
  const colors = createColors();
  colors._getField(0).setValue('red');
  expect(colors._getField(1).get('options')).toEqual(options);
});

it('should clear after set with too many values', () => {
  const colors = createColors({ maxSize: 2 });

  colors.setValue(['red', 'green', 'blue']);
  expect(colors.getValue()).toEqual(['red', 'green', 'blue']);

  colors.clearValue();
  expect(colors.getValue()).toEqual(null);
});

it('should not create more than max size fields', () => {
  const colors = createColors({ maxSize: 2 });
  colors._getField(0).setValue('red');
  colors._getField(1).setValue('green');
  expect(colors._fields.length()).toEqual(2);
});
