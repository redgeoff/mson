import clientTestUtils from '../test-utils';
import config from '../config.test.json';
import User from './user';

const user = new User(clientTestUtils.client);

it('should log in', async () => {
  const r = await user.logIn({
    username: config.server.superuser.username,
    password: config.server.superuser.password
  });
  expect(r.data.logIn.token).toBeTruthy();
  expect(r.data.logIn.user.username).toEqual(config.server.superuser.username);
});
