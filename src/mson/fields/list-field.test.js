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

  field.setValue([
    'red',
    'green'
  ]);
  field.validate();
  expect(field.get('err')).toEqual(null);

  field.setValue([
    'red',
    'green',
    'blue'
  ]);
  field.validate();
  expect(field.get('err')).toEqual('2 or less');
});

it('should validate min size', () => {
  const field = new TextListField({
    minSize: 2
  });

  field.setValue([
    'red',
    'green'
  ]);
  field.validate();
  expect(field.get('err')).toEqual(null);

  field.setValue([
    'red'
  ]);
  field.validate();
  expect(field.get('err')).toEqual('2 or more');
});
