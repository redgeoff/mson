// TODO: use jest's globalSetup and globalTeardown when it is included in react-scripts

import clientTestUtils from '../../../mson-server/src/client/test-utils';

const setUp = async () => {
  await clientTestUtils.setUp();
};

setUp().catch(err => {
  console.error(err);
  process.exit(-1);
  // process.exit(0);
});
