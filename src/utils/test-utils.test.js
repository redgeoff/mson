import testUtils from './test-utils';

it('should wait for', async () => {
  let i = 0;
  await testUtils.waitFor(() => i++ > 3);

  await expect(() =>
    testUtils.waitFor(() => undefined, 1, 1)
  ).rejects.toThrow();
});

it('should expect to finish before', async () => {
  await testUtils.expectToFinishBefore(() => testUtils.timeout(10), 200);

  await expect(() =>
    testUtils.expectToFinishBefore(() => testUtils.timeout(20), 10)
  ).rejects.toThrow();
});
