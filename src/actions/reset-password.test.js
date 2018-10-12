import ResetPassword from './reset-password';

it('should reset password', async () => {
  const token = 'my-token';

  const resetPassword = new ResetPassword({ token });

  resetPassword._registrar = {
    resetPassword: {
      resetPassword: () => {}
    }
  };

  const resetPasswordSpy = jest.spyOn(
    resetPassword._registrar.resetPassword,
    'resetPassword'
  );

  const context = 'foo';

  await resetPassword.run({ context });

  expect(resetPasswordSpy).toHaveBeenCalledWith({ context, token });
});
