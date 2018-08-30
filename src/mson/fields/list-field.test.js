import ListField from './list-field';
import TextField from './text-field';
import TextListField from './text-list-field';
import testUtils from '../test-utils';

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

  testUtils.expectValuesToBeValid(field, [['one'], [], null]);

  testUtils.expectValuesToBeInvalid(
    field,
    [{ foo: 'must not be object' }, false, 1, 1.0, 'must not be string'],
    [{ error: 'must be an array' }]
  );
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

it('should handle dirty factory', () => {
  const field = new TextListField();

  const setSpy = jest.spyOn(field, 'set');

  field._handleDirtyFactory()(false);
  expect(setSpy).toHaveBeenCalledTimes(0);

  field._handleDirtyFactory()(true);
  expect(setSpy).toHaveBeenCalledWith({ dirty: true });
});

it('should set block', () => {
  const field = new TextListField({ value: ['red'] });

  field.set({ block: true });
  expect(field.get('block')).toEqual(true);
  field.eachField(field => expect(field.get('block')).toEqual(true));

  field.set({ block: false });
  expect(field.get('block')).toEqual(false);
  field.eachField(field => expect(field.get('block')).toEqual(false));
});

it('should set full width', () => {
  const field = new TextListField({ value: ['red'] });

  field.set({ fullWidth: true });
  expect(field.get('fullWidth')).toEqual(true);
  field.eachField(field => expect(field.get('fullWidth')).toEqual(true));

  field.set({ fullWidth: false });
  expect(field.get('fullWidth')).toEqual(false);
  field.eachField(field => expect(field.get('fullWidth')).toEqual(false));
});

it('new field should throw when field not defined', () => {
  const field = new ListField();
  expect(() => field._newField(0)).toThrow();
});
