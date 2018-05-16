import compiler from '../compiler';

beforeAll(() => {
  compiler.registerComponent('org.proj.ChangePasswordForm', {
    component: 'Form',
    fields: [
      {
        component: 'PasswordField',
        name: 'password',
        label: 'New Password',
        required: true
      },
      {
        component: 'PasswordField',
        name: 'retypePassword',
        label: 'Retype Password',
        required: true
      }
    ],
    validators: [
      {
        where: {
          retypePassword: {
            value: {
              $ne: '{{password.value}}'
            }
          }
        },
        error: {
          field: 'retypePassword',
          error: 'must match'
        }
      }
    ]
  });

  compiler.registerComponent('org.proj.ChangePassword', {
    component: 'RecordEditor',
    baseForm: 'org.proj.ChangePasswordForm',
    label: 'Password'
  });
});

afterAll(() => {
  compiler.deregisterComponent('org.proj.ChangePasswordForm');
  compiler.deregisterComponent('org.proj.ChangePassword');
});

it('should auto validate', () => {
  const changePassword = compiler.newComponent({
    component: 'org.proj.ChangePassword'
  });
  changePassword.set({ autoValidate: true });
  changePassword.getField('password').setValue('secret123');
  changePassword.getField('retypePassword').setValue('secret1234');
  expect(changePassword.getErrs()).toEqual([
    { field: 'retypePassword', error: 'must match' }
  ]);
});
