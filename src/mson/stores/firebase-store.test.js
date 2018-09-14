import FirebaseStore from './firebase-store';
import FirebaseMock from './firebase-mock';
import { shouldCRUD, shouldGetAll } from './memory-store.test';
import testUtils from '../test-utils';

it('should CRUD', () =>
  shouldCRUD(FirebaseStore, { firebase: new FirebaseMock(), apiKey: 'key' }));

it('should get all', () =>
  shouldGetAll(FirebaseStore, { firebase: new FirebaseMock(), apiKey: 'key' }));

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

  // // Simulate update
  // const afterUpdate = testUtils.once(store, 'updateDoc');
  // const docToUpdate = {
  //   type: 'modified',
  //   data: {
  //     id: '3',
  //     userId: null,
  //     archivedAt: null,
  //     createdAt,
  //     updatedAt: createdAt,
  //     fieldValues: {
  //       id: '3',
  //       firstName: 'Ronald'
  //     }
  //   }
  // };
  // firebaseMock.emitSnapshot([docToUpdate]);
  // const updated = await afterUpdate;
  // expect(updated[0].value).toEqual(docToUpdate.data);

  // // Simulate delete
  // const afterDelete = testUtils.once(store, 'deleteDoc');
  // const docToDelete = {
  //   type: 'removed',
  //   data: {
  //     id: '3',
  //     userId: null,
  //     archivedAt: null,
  //     createdAt,
  //     updatedAt: createdAt,
  //     fieldValues: {
  //       id: '3',
  //       firstName: 'Ronald'
  //     }
  //   }
  // };
  // firebaseMock.emitSnapshot([docToDelete]);
  // const deleted = await afterDelete;
  // expect(deleted[0].value).toEqual(docToDelete.data);

  // // Emit errors
  // const err = {};
  // const emitErrorSpy = jest.spyOn(store, '_emitError');
  // firebaseMock.emitError(err);
  // expect(emitErrorSpy).toHaveBeenCalledWith(err);
});

it('should not set if apiKey missing', async () => {
  const store = new FirebaseStore();
  await store._docSet();
});
