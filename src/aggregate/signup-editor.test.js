import compiler from '../compiler';
import testUtils from '../test-utils';

let acts;
let editor;

const baseForm = {
  component: 'User',
  fields: [
    {
      component: 'SelectField',
      name: 'roles',
      label: 'Roles',
      multiple: true,
      options: [{ value: 'admin', label: 'Admin' }],
    },
  ],
};

beforeEach(() => {
  acts = [];
  editor = compiler.newComponent({
    component: 'SignupEditor',
    baseForm,
    store: {
      component: 'MemoryStore',
    },
  });
});

it('should auto validate', async () => {
  editor.set({ autoValidate: true });
  editor.setValues({
    username: 'test@example.com',
    password: 'secret123',
    retypePassword: 'secret1234',
  });
  expect(editor.getErrs()).toEqual([
    { field: 'retypePassword', error: 'must match' },
  ]);
});

it('should initialize', async () => {
  testUtils.mockComponentListeners(editor, acts, false);

  await editor.resolveAfterCreate();

  testUtils.expectActsToContain(acts, [
    {
      name: 'Set',
      props: {
        value: {
          'fields.username.out': true,
          'fields.password.hidden': false,
          'fields.password.out': true,
          'fields.password.block': false,
          'fields.roles.hidden': true,
          'fields.save.label': 'Create Account',
          'fields.save.icon': 'CheckCircle',
        },
      },
    },
  ]);
});

it('should save', async () => {
  await editor.resolveAfterCreate();

  testUtils.mockComponentListeners(editor, acts, false, true);

  await editor.runListeners('didSave');

  testUtils.expectActsToContain(acts, [
    {
      name: 'LogInToApp',
    },
    {
      name: 'Redirect',
    },
  ]);
});
