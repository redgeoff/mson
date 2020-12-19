import compiler from '../compiler';
import testUtils from '../test-utils';

let acts;
let editor;

beforeEach(() => {
  acts = [];
  editor = compiler.newComponent({
    component: 'UpdatePassword',
    componentToWrap: {
      component: 'User',
      fields: [
        {
          name: 'save',
          component: 'ButtonField',
        },
        {
          name: 'cancel',
          component: 'ButtonField',
        },
      ],
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
        name: 'hidden',
        value: true,
      },
    },
    {
      name: 'Set',
      props: {
        name: 'component',
        value: {
          'fields.save.hidden': false,
          'fields.cancel.hidden': false,
        },
      },
    },
    {
      name: 'Set',
      props: {
        name: 'out',
        value: false,
      },
    },
    {
      name: 'Set',
      props: {
        name: 'component',
        value: {
          'fields.password.hidden': false,
          'fields.password.out': true,
          'fields.password.required': true,
          'fields.retypePassword.hidden': false,
        },
      },
    },
  ]);
});
