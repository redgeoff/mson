import TimeField from './time-field';
import testUtils from '../test-utils';

it('should convert dates to epoch time', () => {
  const date = new TimeField();
  const now = new Date();
  date.setValue(now);
  expect(date.getValue()).toEqual(now.getTime());
});

it('should get display value', () => {
  const date = new TimeField();

  const now = new Date();
  const toLocaleTimeStringSpy = jest.spyOn(now, 'toLocaleTimeString');
  date._toLocaleString(now);
  expect(toLocaleTimeStringSpy).toHaveBeenCalledTimes(1);

  date.set({ showSeconds: true });
  date._toLocaleString(now);
  expect(toLocaleTimeStringSpy).toHaveBeenCalledTimes(2);

  // Mock for same results regardless of environment
  date._toLocaleString = date => {
    return date.toLocaleTimeString('en-US');
  };

  expect(date.getDisplayValue()).toEqual(null);
  date.setValue('2018-9-17 17:08:57');
  expect(date.getDisplayValue()).toEqual('5:08:57 PM');
});

it('should validate', () => {
  const field = new TimeField();

  testUtils.expectValuesToBeValid(field, [
    1537985158759,
    '2018-12-12 8:12 AM',
    '2018-12-12 12:00 PM',
    '2018-12-12 22:00',
    null
  ]);

  field.set({ required: true });

  testUtils.expectValuesToBeInvalid(field, [
    '2018-12-12 40:00 PM',
    '2018-12-12 10:00 ZM',
    null
  ]);
});
