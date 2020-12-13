import compiler from '../compiler';

it('should auto validate', async () => {
  const editor = compiler.newComponent({
    component: 'ResetPasswordEditor',
  });
  editor.set({ autoValidate: true });
  editor.getField('password').setValue('secret123');
  editor.getField('retypePassword').setValue('secret1234');
  expect(editor.getErrs()).toEqual([
    { field: 'retypePassword', error: 'must match' },
  ]);
});
