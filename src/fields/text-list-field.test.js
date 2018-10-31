import TextListField from './text-list-field';
import testUtils from '../test-utils';

it('should support invalid reg exp', () => {
  const field = new TextListField();
  field.set({ invalidRegExp: '/^red|blue$/' });

  testUtils.expectValuesToBeValid(field, [['green'], [], [''], [null], null]);

  testUtils.expectValuesToBeInvalid(field, [
    ['red'],
    ['red', 'blue'],
    ['red', 'green'],
    ['red', null],
    ['red', '']
  ]);
});
