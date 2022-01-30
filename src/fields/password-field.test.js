import { PasswordField } from './index';
import testUtils from '../utils/test-utils';

it('should validate', () => {
  const field = new PasswordField();

  testUtils.expectValuesToBeValid(field, [null, 'secret123']);

  testUtils.expectValuesToBeInvalid(field, ['secret', 'secretsecret']);
});
