import LogOutOfApp from './log-out-of-app';

it('should log out of app', async () => {
  const logOutOfApp = new LogOutOfApp();

  // Mock
  logOutOfApp._registrar = {
    client: {
      user: {
        logOutOfApp: () => {}
      }
    }
  };

  const logOutOfAppSpy = jest.spyOn(
    logOutOfApp._registrar.client.user,
    'logOutOfApp'
  );

  await logOutOfApp.act();

  expect(logOutOfAppSpy).toHaveBeenCalledTimes(1);
});
