import RecordStore from './record-store';
import Form from '../form';
import { TextField } from '../fields';
import testUtils from '../test-utils';

let store = null;
const storeName = 'MyStore';
const appId = 'appId';
const id = 'myId';

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

  const created = {
    foo: 'bar'
  };

  const response = {
    data: {
      createRecord: created
    }
  };

  store._registrar = {
    client: {
      record: {
        create: async () => response
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

it('should update', async () => {
  const form = createForm();

  const updated = {
    foo: 'bar'
  };

  const response = {
    data: {
      updateRecord: updated
    }
  };

  store._registrar = {
    client: {
      record: {
        update: async () => response
      }
    }
  };

  const updateSpy = jest.spyOn(store._registrar.client.record, 'update');

  expect(await store.update({ form, id })).toEqual(updated);

  expect(updateSpy).toHaveBeenCalledWith({
    appId,
    id,
    componentName: storeName,
    fieldValues: form.getValues()
  });
});

it('should archive', async () => {
  const archived = {
    archivedAt: new Date()
  };

  const response = {
    data: {
      archiveRecord: archived
    }
  };

  store._registrar = {
    client: {
      record: {
        archive: async () => response
      }
    }
  };

  const clearCacheSpy = jest.spyOn(store, '_clearCache');
  const archiveSpy = jest.spyOn(store._registrar.client.record, 'archive');

  expect(await store.archive({ id })).toEqual(archived);

  expect(clearCacheSpy).toHaveBeenCalledTimes(1);
  expect(archiveSpy).toHaveBeenCalledWith({
    appId,
    componentName: storeName,
    id
  });
});

it('should restore', async () => {
  const restored = {
    archivedAt: null
  };

  const response = {
    data: {
      restoreRecord: restored
    }
  };

  store._registrar = {
    client: {
      record: {
        restore: async () => response
      }
    }
  };

  const clearCacheSpy = jest.spyOn(store, '_clearCache');
  const restoreSpy = jest.spyOn(store._registrar.client.record, 'restore');

  expect(await store.restore({ id })).toEqual(restored);

  expect(clearCacheSpy).toHaveBeenCalledTimes(1);
  expect(restoreSpy).toHaveBeenCalledWith({
    appId,
    componentName: storeName,
    id
  });
});

it('should get showArchived where', () => {
  expect(store._getShowArchivedWhere()).toEqual({ archivedAt: null });
  expect(store._getShowArchivedWhere(true)).toEqual({
    archivedAt: { $ne: null }
  });
});

it('should get all', async () => {
  const all = {};

  store._registrar = {
    client: {
      record: {
        getAll: async () => all
      }
    }
  };

  const addToCacheSpy = jest.spyOn(store, '_addToCache');
  const getAllSpy = jest.spyOn(store._registrar.client.record, 'getAll');

  const after = 'after';
  const first = 'first';
  const before = 'before';
  const last = 'last';
  const order = 'order';

  expect(
    await store.getAll({
      where: {
        foo: 'bar'
      },
      after,
      first,
      before,
      last,
      order
    })
  ).toEqual(all);

  const opts = {
    appId,
    componentName: storeName,
    asArray: true,
    where: {
      $and: [
        {
          archivedAt: null
        },
        {
          foo: 'bar'
        }
      ]
    },
    after,
    first,
    before,
    last,
    order,
    bypassCache: true
  };

  expect(addToCacheSpy).toHaveBeenCalledTimes(1);
  expect(getAllSpy).toHaveBeenCalledWith(opts);

  expect(
    await store.getAll({
      where: {
        foo: 'bar'
      },
      after,
      first,
      before,
      last,
      order
    })
  ).toEqual(all);

  // Verify cache used
  expect(addToCacheSpy).toHaveBeenCalledTimes(1);
  expect(getAllSpy).toHaveBeenCalledWith(
    Object.assign({}, opts, { bypassCache: undefined })
  );
});
