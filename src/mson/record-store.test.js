import RecordStore from './record-store';
import Form from './form';
import testUtils from './test-utils';

it('should request', async () => {
  const store = new RecordStore();

  store._globals = {
    get: () => 'appId'
  };

  store._uberUtils = {
    setFormErrorsFromAPIError: () => {},
    displayError: () => {}
  };

  const container = {
    promiseFactory: async () => {}
  };

  const promiseFactorySpy = jest.spyOn(container, 'promiseFactory');
  const setFormErrorsFromAPIErrorSpy = jest.spyOn(
    store._uberUtils,
    'setFormErrorsFromAPIError'
  );
  const displayError = jest.spyOn(store._uberUtils, 'displayError');

  // Success
  await store._request(null, container.promiseFactory);
  expect(promiseFactorySpy).toHaveBeenCalledWith('appId');
  expect(setFormErrorsFromAPIErrorSpy).toHaveBeenCalledTimes(0);
  expect(displayError).toHaveBeenCalledTimes(0);

  // Error and form is defined
  const err = new Error();
  container.promiseFactory = async () => {
    throw err;
  };
  const props = { form: new Form() };
  await testUtils.expectToThrow(
    () => store._request(props, container.promiseFactory),
    err
  );
  expect(setFormErrorsFromAPIErrorSpy).toHaveBeenCalledWith(err, props.form);
  expect(displayError).toHaveBeenCalledTimes(0);

  // Error and no form defined
  setFormErrorsFromAPIErrorSpy.mockReset();
  await testUtils.expectToThrow(
    () => store._request({}, container.promiseFactory),
    err
  );
  expect(setFormErrorsFromAPIErrorSpy).toHaveBeenCalledTimes(0);
  expect(displayError).toHaveBeenCalledWith(err.toString());
});
