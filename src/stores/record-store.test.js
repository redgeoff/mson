import RecordStore from './record-store';
import Form from '../form';
import { TextField } from '../fields';
import testUtils from '../test-utils';
import { shouldCRUD, shouldGetAll, shouldMove } from './store-test';
import RecordMock from './record-mock';

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
  await store._request(container);
  expect(promiseFactorySpy).toHaveBeenCalledWith(appId);
  expect(setFormErrorsFromAPIErrorSpy).toHaveBeenCalledTimes(0);
  expect(displayError).toHaveBeenCalledTimes(0);

  // Error and form is defined
  const err = new Error();
  container.promiseFactory = async () => {
    throw err;
  };
  const form = new Form();
  await testUtils.expectToThrow(
    () => store._request({ form, promiseFactory: container.promiseFactory }),
    err
  );
  expect(setFormErrorsFromAPIErrorSpy).toHaveBeenCalledWith(err, form);
  expect(displayError).toHaveBeenCalledTimes(0);

  // Error and no form defined
  setFormErrorsFromAPIErrorSpy.mockReset();
  await testUtils.expectToThrow(() => store._request(container), err);
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

  expect(await store.createDoc({ form })).toEqual(created);

  expect(clearCacheSpy).toHaveBeenCalledTimes(1);
  expect(createSpy).toHaveBeenCalledWith({
    appId,
    componentName: storeName,
    fieldValues: form.getValues()
  });
});

it('should update', async () => {
  const form = createForm();
  form.setValues({ id });

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

  expect(await store.updateDoc({ form })).toEqual(updated);

  expect(updateSpy).toHaveBeenCalledWith({
    appId,
    id,
    componentName: storeName,
    fieldValues: form.getValues({ default: false })
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

  expect(await store.archiveDoc({ id })).toEqual(archived);

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

  expect(await store.restoreDoc({ id })).toEqual(restored);

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

  const response = {
    data: {
      records: all
    }
  };

  store._registrar = {
    client: {
      record: {
        getAll: async () => response
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
    await store.getAllDocs({
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
    await store.getAllDocs({
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

it('should upsert and get', async () => {
  const form = createForm();

  const id = 'myId';

  form.setValues({ id });

  const created = {
    foo: 'bar'
  };

  store._registrar = {
    client: {
      record: {
        create: async () => ({
          data: {
            createRecord: created
          }
        }),
        get: () => {
          throw new Error('GraphQL error: record not found');
        },
        update: async () => ({
          data: {
            updateRecord: created
          }
        })
      }
    }
  };

  const clearCacheSpy = jest.spyOn(store, '_clearCache');
  const createSpy = jest.spyOn(store._registrar.client.record, 'create');
  const updateSpy = jest.spyOn(store._registrar.client.record, 'update');

  // Create
  expect(await store.upsertDoc({ form })).toEqual(created);
  expect(clearCacheSpy).toHaveBeenCalledTimes(1);
  expect(createSpy).toHaveBeenCalledWith({
    appId,
    componentName: storeName,
    fieldValues: form.getValues({ default: false })
  });

  // Create without id
  const form2 = createForm();
  const created2 = await store.upsertDoc({ form: form2 });
  expect(created2).toEqual(created);
  expect(clearCacheSpy).toHaveBeenCalledTimes(2);
  expect(createSpy).toHaveBeenCalledWith({
    appId,
    componentName: storeName,
    fieldValues: form2.getValues({ default: false })
  });

  // Get
  store._registrar.client.record.get = () => ({
    data: {
      record: created
    }
  });
  expect(await store.getDoc({ id: 'myId' })).toEqual(created);

  // Update
  expect(await store.upsertDoc({ form })).toEqual(created);
  expect(updateSpy).toHaveBeenCalledWith({
    appId,
    id,
    componentName: storeName,
    fieldValues: form.getValues({ default: false })
  });

  // Error other than "not found"
  const err = new Error();
  store._registrar.client.record.get = () => {
    throw err;
  };
  testUtils.expectToThrow(() => store.upsertDoc({ form }), err);
});

class RecordStoreMock extends RecordStore {
  constructor(props) {
    super(props);
    this._registrar.client = {
      record: new RecordMock(),
      user: {
        getSession: () => null
      }
    };
  }
}

it('should CRUD', () => shouldCRUD(RecordStoreMock));

// TODO:
// it('should get all', () => shouldGetAll(RecordStoreMock));

// TODO:
// it('should move', () => shouldMove(RecordStoreMock));
