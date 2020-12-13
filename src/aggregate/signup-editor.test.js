import compiler from '../compiler';

let acts;
let editor;

const baseForm = {
  component: 'Form',
  fields: [
    {
      component: 'PasswordField',
      name: 'password',
      label: 'New Password',
      required: true,
    },
    {
      component: 'PasswordField',
      name: 'retypePassword',
      label: 'Retype Password',
      required: true,
    },
  ],
};

beforeEach(() => {
  acts = [];
  editor = compiler.newComponent({
    component: 'SignupEditor',
    baseForm,
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
