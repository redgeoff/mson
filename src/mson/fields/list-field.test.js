import ListField from './list-field';
import TextField from './text-field';

class TextListField extends ListField {
  _newField(index) {
    return new TextField({
      name: index,
      label: index === 0 ? this.get('label') : undefined,
      required: false,
      block: this.get('block') === undefined ? true : this.get('block'),
      fullWidth: this.get('fullWidth'),
      options: this.get('options')
    });
  }
}

it('should validate max size', () => {
  const field = new TextListField({
    maxSize: 2
  });

  field.setValue(['red', 'green']);
  field.validate();
  expect(field.get('err')).toEqual(null);

  field.setValue(['red', 'green', 'blue']);
  field.validate();
  expect(field.get('err')).toEqual([{ error: '2 or less' }]);
});

it('should validate min size', () => {
  const field = new TextListField({
    minSize: 2
  });

  field.setValue(['red', 'green']);
  field.validate();
  expect(field.get('err')).toEqual(null);

  field.setValue(['red']);
  field.validate();
  expect(field.get('err')).toEqual([{ error: '2 or more' }]);
});

it('should allow for field property', () => {
  const field = new ListField({
    field: new TextField({
      name: 'color',
      label: 'Color'
    }),
    minSize: 2
  });

  field.setValue(['red', 'green']);
  field.validate();
  expect(field.get('err')).toEqual(null);

  field.setValue(['red']);
  field.validate();
  expect(field.get('err')).toEqual([{ error: '2 or more' }]);
});

it('should report bad types', () => {
  const field = new TextListField();

  const validValues = [['one'], [], null];

  validValues.forEach(value => {
    field.setValue(value);
    field.validate();
    expect(field.hasErr()).toEqual(false);
  });

  const invalidValues = [
    { foo: 'must not be object' },
    false,
    1,
    1.0,
    'must not be string'
  ];

  invalidValues.forEach(value => {
    field.setValue(value);
    field.validate();
    expect(field.hasErr()).toEqual(true);
    expect(field.getErr()).toEqual([{ error: 'must be an array' }]);
  });
});

it('should allow scalar values', () => {
  const field = new TextListField();

  field.setValue('one');
  field.validate();
  expect(field.hasErr()).toEqual(true);
  expect(field.getErr()).toEqual([{ error: 'must be an array' }]);

  field.set({ allowScalar: true });
  field.setValue('one');
  field.validate();
  expect(field.hasErr()).toEqual(false);
  expect(field.getValue()).toEqual(['one']); // still an array
});
