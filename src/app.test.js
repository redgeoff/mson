import App from './app';
import testUtils from './test-utils';

it('should emit logged out', async () => {
  const app = new App();
  const loggedOut = testUtils.once(app, 'loggedOut');
  app.emitLoggedOut();
  await loggedOut;
});
