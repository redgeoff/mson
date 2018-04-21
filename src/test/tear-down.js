// TODO: use jest's globalSetup and globalTeardown when it is included in react-scripts

import clientTestUtils from '../mson/client/test-utils';

const tearDown = async () => {
  await clientTestUtils.tearDown();
};

tearDown().catch(err => {
  console.error(err);
  process.exit(-1);
  // process.exit(0);
});
