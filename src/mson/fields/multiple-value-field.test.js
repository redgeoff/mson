import MultipleValueField from './multiple-value-field';
import testUtils from '../test-utils';

it('should validate max size', () => {
  const field = new MultipleValueField({
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
  const field = new MultipleValueField({
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
  const field = new MultipleValueField();

  testUtils.expectValuesToBeValid(field, [['one'], [], null]);

  testUtils.expectValuesToBeInvalid(
    field,
    [{ foo: 'must not be object' }, false, 1, 1.0, 'must not be string'],
    [{ error: 'must be an array' }]
  );
});

it('should allow scalar values', () => {
  const field = new MultipleValueField();

  field.setValue('one');
  field.validate();
  expect(field.hasErr()).toEqual(true);
  expect(field.getErr()).toEqual([{ error: 'must be an array' }]);

  field.set({ allowScalar: true });
  field.setValue('one');
  field.validate();
  expect(field.hasErr()).toEqual(false);
  expect(field.getValue()).toEqual('one');
});
