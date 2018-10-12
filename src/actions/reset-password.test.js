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

  await resetPassword.run();

  expect(resetPasswordSpy).toHaveBeenCalledWith(token);
});
