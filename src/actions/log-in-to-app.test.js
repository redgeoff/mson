import LogInToApp from './log-in-to-app';
import compiler from '../compiler';
import testUtils from '../test-utils';

it('should log in to app', async () => {
  const form = compiler.newComponent({
    component: 'Form',
    fields: [
      {
        component: 'EmailField',
        name: 'username'
      },
      {
        component: 'PasswordField',
        name: 'password'
      }
    ]
  });

  const fieldValues = {
    username: 'test@example.com',
    password: 'secret'
  };

  form.setValues(fieldValues);

  const logInToApp = new LogInToApp();

  // Mock
  logInToApp._registrar = {
    client: {
      user: {
        logInToApp: () => {}
      }
    }
  };
  logInToApp._globals = {
    get: () => 'appId'
  };

  const logInToAppSpy = jest.spyOn(
    logInToApp._registrar.client.user,
    'logInToApp'
  );

  await logInToApp.act({
    component: form
  });

  expect(logInToAppSpy).toHaveBeenCalledWith({
    appId: 'appId',
    ...fieldValues
  });

  // Simulate error
  const err = new Error();
  logInToApp._registrar = {
    client: {
      user: {
        logInToApp: async () => {
          throw err;
        }
      }
    }
  };

  await testUtils.expectToThrow(() => {
    return logInToApp.act({
      component: form
    });
  }, err);
  expect(form.getErrs()).toEqual([
    { field: 'password', error: 'invalid email or password' }
  ]);
});
