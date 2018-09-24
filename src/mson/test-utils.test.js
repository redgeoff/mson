import testUtils from './test-utils';

it('should wait for', async () => {
  let i = 0;
  await testUtils.waitFor(() => i++ > 3);

  await testUtils.expectToThrow(() => testUtils.waitFor(() => undefined, 1, 1));
});

it('should expect to finish before', async () => {
  await testUtils.expectToFinishBefore(() => testUtils.timeout(10), 200);

  await testUtils.expectToThrow(() =>
    testUtils.expectToFinishBefore(() => testUtils.timeout(20), 10)
  );
});

it('should expect to throw', async () => {
  const errMessage = 'my error';
  const err = new Error(errMessage);
  const promiseFactory = async () => {
    throw err;
  };

  expect(await testUtils.expectToThrow(promiseFactory)).toEqual(err);
  await testUtils.expectToThrow(promiseFactory, err);
  await testUtils.expectToThrow(promiseFactory, 'Error');
  await testUtils.expectToThrow(promiseFactory, null, errMessage);
});
