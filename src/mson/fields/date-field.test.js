import DateField from './date-field';
import testUtils from '../test-utils';

it('should convert dates to strings', () => {
  const date = new DateField();
  const now = new Date();
  date.setValue(now);
  expect(date.getValue()).toEqual(now.toISOString());
});

it('should set value to now', async () => {
  const date1 = new DateField({ now: true });
  await testUtils.sleepToEnsureDifferentTimestamps();
  const date2 = new DateField({ now: true });
  expect(date2.getValue() > date1.getValue()).toEqual(true);
});
