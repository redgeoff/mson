import IntegerField from './integer-field';
import testUtils from '../test-utils';

it('should validate', () => {
  const field = new IntegerField();

  testUtils.expectValuesToBeValid(field, ['111', '-111', '+111', '0']);

  testUtils.expectValuesToBeInvalid(field, [
    'aaa111',
    '111aaa',
    '123-',
    '123+',
    '1.1',
    '+',
    '0123'
  ]);
});
