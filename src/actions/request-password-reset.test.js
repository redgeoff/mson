import RequestPasswordReset from './request-password-reset';
import Form from '../form';
import { EmailField } from '../fields';

it('should request password reset', async () => {
  const email = 'test@example.com';

  const form = new Form({
    fields: [new EmailField({ name: 'email', value: email })]
  });

  const requestPasswordReset = new RequestPasswordReset();

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

  await requestPasswordReset.run({ context, component: form });

  expect(requestResetSpy).toHaveBeenCalledWith({ context, component: form });
});
