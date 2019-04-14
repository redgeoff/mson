import DateField from './date-field';
import testUtils from '../test-utils';

it('should convert dates to epoch time', () => {
  const date = new DateField();
  const now = new Date();
  date.setValue(now);
  expect(date.getValue()).toEqual(now.getTime());
});

it('should handle string epoch time', () => {
  const date = new DateField();
  const now = new Date();
  date.setValue(String(now.getTime()));
  expect(date.getValue()).toEqual(now.getTime());
});

it('should set value to now', async () => {
  const date1 = new DateField({ now: true });
  await testUtils.sleepToEnsureDifferentTimestamps();
  const date2 = new DateField({ now: true });
  expect(date2.getValue() > date1.getValue()).toEqual(true);
});

it('should get display value', () => {
  const date = new DateField();

  const now = new Date();
  const toLocaleDateStringSpy = jest.spyOn(now, 'toLocaleDateString');
  date._toLocaleString(now);
  expect(toLocaleDateStringSpy).toHaveBeenCalledTimes(1);

  date.set({ includeTime: true });
  const toLocaleStringSpy = jest.spyOn(now, 'toLocaleString');
  date._toLocaleString(now);
  expect(toLocaleStringSpy).toHaveBeenCalledTimes(1);

  // Mock for same results regardless of environment
  date._toLocaleString = date => {
    return date.toLocaleString('en-US');
  };

  expect(date.getDisplayValue()).toEqual(null);
  date.setValue('2018-9-17 17:08:57');
  expect(date.getDisplayValue()).toEqual('9/17/2018, 5:08:57 PM');
});

it('should validate', () => {
  const field = new DateField();

  testUtils.expectValuesToBeValid(field, [
    1537985158759,
    '2018-1-1',
    '2018-12-12 8:12 AM',
    '1/1/2018',
    null
  ]);

  field.set({ required: true });

  testUtils.expectValuesToBeInvalid(field, [
    '1/1/-1',
    '2018-1-1 40:00 PM',
    '2018-1-1 10:00 ZM',
    null
  ]);

  field.set({
    minDate: '2018-01-01',
    maxDate: '2018-12-31'
  });

  testUtils.expectValuesToBeValid(field, [
    '2018-01-01',
    '2018-12-31',
    '2018-02-01',
    '2018-01-01 10:00 AM'
  ]);

  testUtils.expectValuesToBeInvalid(field, ['2017-01-01', '2019-01-01']);
});
