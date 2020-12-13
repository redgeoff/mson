import compiler from '../compiler';
import testUtils from '../test-utils';

let acts;
let editor;

beforeEach(() => {
  acts = [];
  editor = compiler.newComponent({
    component: 'ResetPasswordEditor',
  });
});

it('should auto validate', async () => {
  editor.set({ autoValidate: true });
  editor.getField('password').setValue('secret123');
  editor.getField('retypePassword').setValue('secret1234');
  expect(editor.getErrs()).toEqual([
    { field: 'retypePassword', error: 'must match' },
  ]);
});

it('should createRecord', async () => {
  const resetPassword = jest.fn();

  const mockedRegistrar = {
    resetPassword: {
      resetPassword,
    },
  };

  testUtils.mockComponentListeners(
    editor,
    acts,
    false,
    false,
    false,
    mockedRegistrar
  );

  editor.getField('token').setValue('token123');

  await editor.runListeners('createRecord');

  expect(resetPassword).toHaveBeenCalledWith({
    ...resetPassword.mock.calls[0][0],
    token: 'token123',
  });
});

// it('should reset password', async () => {

// });
