import MemoryStore from './memory-store';
import {
  shouldCRUD,
  shouldGetAll,
  shouldMove,
  createDoc,
  updateDoc
} from './store-test';
import { Reorder } from './reorder';

it('should create, update, archive & restore', async () => {
  await shouldCRUD(MemoryStore);
});

it('should get all', async () => {
  await shouldGetAll(MemoryStore);
});

it('should move', async () => {
  await shouldMove(MemoryStore);
});

it('should reorder', async () => {
  const store = new MemoryStore();

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

  // Create
  const harry = await createDoc(store, harryValues);
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: 0
  });

  // Create again
  const hermione = await createDoc(store, hermioneValues);
  expect(await store.getDoc({ id: hermione.id })).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: 1
  });

  // Update
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

  // Archive
  await store.archiveDoc({ id: harry.id, order: null });
  expect(await store.getDoc({ id: hermione.id })).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: Reorder.DEFAULT_ORDER
  });

  // Restore
  await store.restoreDoc({ id: harry.id, order: 1 });
  expect(await store.getDoc({ id: hermione.id })).toMatchObject({
    fieldValues: hermioneFieldValues,
    order: 0
  });
  expect(await store.getDoc({ id: harry.id })).toMatchObject({
    fieldValues: harryFieldValues,
    order: 1
  });
});
