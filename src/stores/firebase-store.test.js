import FirebaseStore from './firebase-store';
import FirebaseMock from './firebase-mock';
import {
  shouldCRUD,
  shouldGetAll,
  shouldMove,
  createDoc,
  updateDoc
} from './store-test';
import testUtils from '../test-utils';
import { Reorder } from './reorder';

it('should CRUD', () =>
  shouldCRUD(FirebaseStore, { firebase: new FirebaseMock(), apiKey: 'key' }));

it('should get all', () =>
  shouldGetAll(FirebaseStore, { firebase: new FirebaseMock(), apiKey: 'key' }));

it('should move', () =>
  shouldMove(FirebaseStore, { firebase: new FirebaseMock(), apiKey: 'key' }));

it('should listen to changes', async () => {
  const docs = [
    {
      id: '1',
      userId: null,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      fieldValues: {
        id: '1',
        firstName: 'Harry'
      }
    },
    {
      id: '2',
      userId: '2',
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      fieldValues: {
        id: '2',
        firstName: 'Hermione'
      }
    }
  ];

  const firebaseMock = new FirebaseMock(
    docs.map(doc => ({ value: doc, id: doc.id }))
  );

  const store = new FirebaseStore({
    firebase: firebaseMock,
    apiKey: 'key'
  });

  // Verify initial load
  await testUtils.once(store, 'didLoad');
  const initialDocs = await store.getAllDocs({ showArchived: false });
  expect(initialDocs.edges.map(doc => doc.node)).toEqual(docs);

  // Use string to avoid race condition on comparing dates
  const createdAt = new Date().toISOString();

  // Simulate create
  const afterCreate = testUtils.once(store, 'createDoc');
  const docToCreate = {
    type: 'added',
    data: {
      id: '3',
      userId: null,
      archivedAt: null,
      createdAt,
      updatedAt: createdAt,
      fieldValues: {
        id: '3',
        firstName: 'Ron'
      }
    }
  };
  firebaseMock.emitSnapshot([docToCreate]);
  const created = await afterCreate;
  expect(created[0].value).toEqual(docToCreate.data);

  // Simulate update
  const afterUpdate = testUtils.once(store, 'updateDoc');
  const docToUpdate = {
    type: 'modified',
    data: {
      id: '3',
      userId: null,
      archivedAt: null,
      createdAt,
      updatedAt: createdAt,
      fieldValues: {
        id: '3',
        firstName: 'Ronald'
      }
    }
  };
  firebaseMock.emitSnapshot([docToUpdate]);
  const updated = await afterUpdate;
  expect(updated[0].value).toEqual(docToUpdate.data);

  // Simulate delete
  const afterDelete = testUtils.once(store, 'deleteDoc');
  const docToDelete = {
    type: 'removed',
    data: {
      id: '3',
      userId: null,
      archivedAt: null,
      createdAt,
      updatedAt: createdAt,
      fieldValues: {
        id: '3',
        firstName: 'Ronald'
      }
    }
  };
  firebaseMock.emitSnapshot([docToDelete]);
  const deleted = await afterDelete;
  expect(deleted[0].value).toEqual(docToDelete.data);

  // Emit errors
  const err = {};
  const emitErrorSpy = jest.spyOn(store, '_emitError');
  firebaseMock.emitError(err);
  expect(emitErrorSpy).toHaveBeenCalledWith(err);
});

it('should not set if apiKey missing', async () => {
  const store = new FirebaseStore();
  await store._docSet({});
});

it('should get firebase from global', () => {
  const store = new FirebaseStore();
  const firebaseMock = new FirebaseMock();
  store._global = {
    firebase: firebaseMock
  };
  expect(store._getFirebase({})).toEqual(firebaseMock);
});

it('should listen to changes with respect to order', async () => {
  const doc1 = {
    id: 'ron',
    userId: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    fieldValues: {
      id: 'ron',
      firstName: 'Ron'
    },
    order: '1'
  };

  const doc2 = {
    id: 'harry',
    userId: null,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    fieldValues: {
      id: 'harry',
      firstName: 'Harry'
    }
  };

  const doc3 = {
    id: 'hermione',
    userId: '2',
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: '1.9',
    fieldValues: {
      id: 'hermione',
      firstName: 'Hermione'
    }
  };

  const docs = [doc1, doc2, doc3];

  const firebaseMock = new FirebaseMock(
    docs.map(doc => ({ value: doc, id: doc.id }))
  );

  const store = new FirebaseStore({
    firebase: firebaseMock,
    apiKey: 'key'
  });

  // Verify initial load
  await testUtils.once(store, 'didLoad');
  const initialDocs = await store.getAllDocs({ showArchived: false });
  expect(initialDocs.edges.map(doc => doc.node)).toEqual([doc1, doc3, doc2]);
});

it('should only initialize app once', () => {
  const firebase = new FirebaseMock();
  const initializeAppSpy = jest.spyOn(firebase, 'initializeApp');

  new FirebaseStore({
    firebase,
    apiKey: 'key'
  });
  expect(initializeAppSpy).toHaveBeenCalledTimes(1);

  new FirebaseStore({
    firebase,
    apiKey: 'key'
  });
  expect(initializeAppSpy).toHaveBeenCalledTimes(1);
});

it('should reorder', async () => {
  const store = new FirebaseStore({
    firebase: new FirebaseMock(),
    apiKey: 'key'
  });

  const harryFieldValues = {
    firstName: 'Harry',
    lastName: 'Potter'
  };

  const harryValues = {
    ...harryFieldValues,
    order: 0
  };

  const hermioneFieldValues = {
    firstName: 'Hermione',
    lastName: 'Granger'
  };

  const hermioneValues = {
    ...hermioneFieldValues,
    order: 0
  };

  const docSetSpy = jest.spyOn(store, '_docSet');

  // Create
  const harry = await createDoc(store, harryValues);
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: 0
  });
  expect(docSetSpy.mock.calls[0][0].doc).toMatchObject({
    fieldValues: harryFieldValues,
    order: 0
  });

  // Create again
  docSetSpy.mockClear();
  const hermione = await createDoc(store, hermioneValues);
  expect(await store.getDoc({ id: hermione.id })).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: 1
  });
  expect(docSetSpy.mock.calls[0][0].doc).toMatchObject({
    fieldValues: harryFieldValues,
    order: 1
  });
  expect(docSetSpy.mock.calls[1][0].doc).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });

  // Update
  docSetSpy.mockClear();
  hermioneValues.id = hermione.id;
  hermioneValues.order = 1;
  await updateDoc(store, hermioneValues);
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: 0
  });
  expect(await store.getDoc({ id: hermione.id })).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 1
  });
  expect(docSetSpy.mock.calls[0][0].doc).toMatchObject({
    fieldValues: harryFieldValues,
    order: 0
  });
  expect(docSetSpy.mock.calls[1][0].doc).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 1
  });

  // Archive
  docSetSpy.mockClear();
  await store.archiveDoc({ id: harry.id, reorder: true });
  expect(await store.getDoc({ id: hermione.id })).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: Reorder.DEFAULT_ORDER
  });
  expect(docSetSpy.mock.calls[0][0].doc).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });
  expect(docSetSpy.mock.calls[1][0].doc).toMatchObject({
    fieldValues: harryFieldValues,
    order: Reorder.DEFAULT_ORDER
  });

  // Restore
  docSetSpy.mockClear();
  await store.restoreDoc({ id: harry.id, reorder: true });
  expect(await store.getDoc({ id: hermione.id })).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: 1
  });
  expect(docSetSpy.mock.calls[0][0].doc).toMatchObject({
    fieldValues: harryFieldValues,
    order: 1
  });
});

it('should strip undefined values when saving', async () => {
  const firebase = new FirebaseMock();

  const store = new FirebaseStore({
    firebase,
    apiKey: 'key'
  });

  const id = 1;

  const setSpy = jest.spyOn(firebase._collection._docs, 'set');

  await store._docSet({
    id,
    doc: {
      firstName: 'Harry',
      lastName: undefined,
      nested: {
        house: 'Gryffindor',
        school: undefined
      }
    }
  });

  expect(setSpy).toHaveBeenCalledWith(id, {
    firstName: 'Harry',
    lastName: undefined,
    nested: {
      house: 'Gryffindor'
    }
  });
  const doc = setSpy.mock.calls[0][1];
  expect(doc.hasOwnProperty('lastName')).toEqual(false);
  expect(doc.nested.hasOwnProperty('school')).toEqual(false);
});
