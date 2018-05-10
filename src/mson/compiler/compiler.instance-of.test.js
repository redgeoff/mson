import compiler from './compiler';
import User from '../form/user';

class EditUserJS extends User {}

beforeAll(() => {
  compiler.registerComponent('test.Account', {
    component: 'Form'
  });

  // Inheritance via MSON
  compiler.registerComponent('test.EditAccountMSON', {
    component: 'test.Account'
  });

  // Inheritance via JS
  compiler.registerComponent('test.EditUserJS', EditUserJS);
});

afterAll(() => {
  compiler.deregisterComponent('test.EditAccountMSON');
  compiler.deregisterComponent('test.EditUserJS');
  compiler.deregisterComponent('test.Account');
});

it('should get instance of', async () => {
  expect(compiler.instanceOf('test.Account', 'Form')).toEqual(true);
  expect(compiler.instanceOf('test.Account', 'Set')).toEqual(false);
  expect(compiler.instanceOf('test.EditAccountMSON', 'test.Account')).toEqual(
    true
  );
  expect(compiler.instanceOf('test.EditAccountMSON', 'Form')).toEqual(true);
  expect(compiler.instanceOf('test.EditAccountMSON', 'Set')).toEqual(false);
  expect(compiler.instanceOf('test.EditUserJS', 'User')).toEqual(true);
  expect(compiler.instanceOf('test.EditUserJS', 'Form')).toEqual(true);
  expect(compiler.instanceOf('test.EditUserJS', 'Set')).toEqual(false);
});
