import SelectListField from './select-list-field';

const options = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' }
];

const createColors = props => {
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

it('should clone', () => {
  // Clone when no values and make sure a new field is created
  const colors = createColors();
  const clonedColors = colors.clone();
  expect(clonedColors._fields.first()).not.toEqual(colors._fields.first());

  // Make sure value is copied after the new fields have been created
  const myColors = ['red', 'green'];
  colors.setValue(myColors);
  const clonedColors2 = colors.clone();
  expect(colors.getValue()).toEqual(myColors);
  expect(clonedColors2.getValue()).toEqual(myColors);
});

it('should set ensureInList', () => {
  const field = createColors({ value: ['red', 'green'] });

  field.set({ ensureInList: true });
  expect(field.get('ensureInList')).toEqual(true);
  field.eachField(field => expect(field.get('ensureInList')).toEqual(true));

  field.set({ ensureInList: false });
  expect(field.get('ensureInList')).toEqual(false);
  field.eachField(field => expect(field.get('ensureInList')).toEqual(false));
});

it('should not remove the last field', () => {
  const field = createColors({ value: ['red'] });
  expect(field._shouldRemoveField(field._fields.last()));
});
