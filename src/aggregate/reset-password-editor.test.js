import compiler from '../compiler';
import MemoryStore from '../stores/memory-store';
import testUtils from '../utils/test-utils';

let acts;
let editor;

const store = new MemoryStore();

beforeEach(() => {
  acts = [];
  editor = compiler.newComponent({
    component: 'ResetPasswordEditor',
    store,
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

it('should reset password', async () => {
  const mockedGlobals = {
    route: {
      parameters: {
        token: 'token123',
      },
    },
  };

  testUtils.mockComponentListeners(editor, acts, false, true, mockedGlobals);

  await editor.runListeners('reset');

  testUtils.expectActsToContain(acts, [
    {
      name: 'Set',
      props: {
        name: 'fields.token.value',
        value: 'token123',
      },
    },
    {
      name: 'UpsertDoc',
      props: {
        store,
      },
    },
    {
      name: 'Snackbar',
      props: {
        message: 'Password updated',
      },
    },
    {
      name: 'Redirect',
      props: {
        path: '/',
      },
    },
  ]);
});
