import RequestPasswordReset from './request-password-reset';

it('should request password reset', async () => {
  const email = 'test@example.com';

  const requestPasswordReset = new RequestPasswordReset({ email });

  requestPasswordReset._registrar = {
    resetPassword: {
      requestReset: () => {}
    }
  };

  const requestResetSpy = jest.spyOn(
    requestPasswordReset._registrar.resetPassword,
    'requestReset'
  );

  const context = 'foo';

  await requestPasswordReset.run({ context });

  expect(requestResetSpy).toHaveBeenCalledWith({ context, email });
});
