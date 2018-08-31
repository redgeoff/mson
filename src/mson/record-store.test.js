import RecordStore from './record-store';
import Form from './form';
import { TextField } from './fields';
import testUtils from './test-utils';

let store = null;
const storeName = 'MyStore';
const appId = 'appId';

beforeEach(() => {
  store = new RecordStore({ storeName });

  store._globals = {
    get: () => appId
  };
});

const createForm = () => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ],
    value: {
      firstName: 'Jay',
      lastName: 'Kay'
    }
  });
};

it('should request', async () => {
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
  expect(promiseFactorySpy).toHaveBeenCalledWith(appId);
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

it('should create', async () => {
  const form = createForm();

  const created = {};

  store._registrar = {
    client: {
      record: {
        create: async () => created
      }
    }
  };

  const clearCacheSpy = jest.spyOn(store, '_clearCache');
  const createSpy = jest.spyOn(store._registrar.client.record, 'create');

  expect(await store.create({ form })).toEqual(created);

  expect(clearCacheSpy).toHaveBeenCalledTimes(1);
  expect(createSpy).toHaveBeenCalledWith({
    appId,
    componentName: storeName,
    fieldValues: form.getValues()
  });
});
