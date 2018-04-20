import clientTestUtils from '../test-utils';
import config from '../config.test.json';
import User from './user';

const user = new User(clientTestUtils.client);

// it('should log in', async () => {
const foo = async () => {
  const r = await user.logIn({
    username: config.server.superuser.username,
    password: config.server.superuser.password
  });
  console.log('r=', JSON.stringify(r));
};
foo();
// });
