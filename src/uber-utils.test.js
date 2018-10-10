import { UberUtils } from './uber-utils';
import Form from './form';
import { TextField } from './fields';
import testUtils from './test-utils';

const result = {};
const promiseFactory = async () => result;

const err = new Error();
const promiseErrorFactory = async () => {
  throw err;
};

it('should setFormErrorsFromAPIError', () => {
  const uberUtils = new UberUtils();

  const displayErrorSpy = jest.spyOn(uberUtils, 'displayError');

  const form = new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ]
  });

  const err = new Error();
  err.graphQLErrors = [
    {
      message: JSON.stringify({
        error: [
          {
            field: 'firstName',
            error: 'required'
          }
        ]
      })
    }
  ];

  uberUtils.setFormErrorsFromAPIError(err, form);
  expect(form.getErrs()).toEqual([{ field: 'firstName', error: 'required' }]);
  expect(displayErrorSpy).toHaveBeenCalledTimes(0);

  // Simulate message is not JSON object
  err.graphQLErrors[0].message = null;
  uberUtils.setFormErrorsFromAPIError(err, form);
  expect(displayErrorSpy).toHaveBeenCalledWith(err.toString());
});

it('should tryAndSetFormErrorsIfAPIError', async () => {
  const uberUtils = new UberUtils();

  const setFormErrorsFromAPIErrorSpy = jest
    .spyOn(uberUtils, 'setFormErrorsFromAPIError')
    .mockImplementation();

  const form = new Form();

  expect(
    await uberUtils.tryAndSetFormErrorsIfAPIError(promiseFactory, form)
  ).toEqual(result);
  expect(setFormErrorsFromAPIErrorSpy).toHaveBeenCalledTimes(0);

  await testUtils.expectToThrow(
    () => uberUtils.tryAndSetFormErrorsIfAPIError(promiseErrorFactory, form),
    err
  );
  expect(setFormErrorsFromAPIErrorSpy).toHaveBeenCalledWith(err, form);
});

it('should tryAndDisplayErrorIfAPIError', async () => {
  const uberUtils = new UberUtils();

  const displayErrorSpy = jest
    .spyOn(uberUtils, 'displayError')
    .mockImplementation();

  expect(await uberUtils.tryAndDisplayErrorIfAPIError(promiseFactory)).toEqual(
    result
  );
  expect(displayErrorSpy).toHaveBeenCalledTimes(0);

  await testUtils.expectToThrow(
    () => uberUtils.tryAndDisplayErrorIfAPIError(promiseErrorFactory),
    err
  );
  expect(displayErrorSpy).toHaveBeenCalledWith(err.toString());
});
