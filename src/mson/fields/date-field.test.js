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

it('should get display value', () => {
  const date = new DateField();

  const toLocaleStringSpy = jest.spyOn(date, '_toLocaleString');
  const now = new Date();
  date._toLocaleString(now);
  expect(toLocaleStringSpy).toHaveBeenCalledWith(now);

  // Mock for same results regardless of environment
  date._toLocaleString = date => {
    return date.toLocaleString('en-US');
  };

  expect(date.getDisplayValue()).toEqual(null);
  date.setValue('2018-9-17 17:08:57');
  expect(date.getDisplayValue()).toEqual('9/17/2018, 5:08:57 PM');
});
