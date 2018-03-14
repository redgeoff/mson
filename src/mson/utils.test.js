import utils from './utils';
import testUtils from './test-utils';

it('should execute promises sequentially', async () => {
  let sleeps = [1000, 100, 10];
  let observed = [];

  const snooze = async ms => {
    await testUtils.timeout(ms);
    observed.push(ms);
  };

  await utils.sequential(sleeps, async ms => {
    await snooze(ms);
  });

  expect(observed).toEqual(sleeps);
});
