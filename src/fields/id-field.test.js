import IdField from './id-field';
import testUtils from '../utils/test-utils';

it('should validate', () => {
  const field = new IdField();

  testUtils.expectValuesToBeValid(field, [
    '123',
    '-123',
    'a-123',
    123,
    0,
    -123,
    12.3,
  ]);

  testUtils.expectValuesToBeInvalid(field, [{ foo: 'bar' }, false]);
});
